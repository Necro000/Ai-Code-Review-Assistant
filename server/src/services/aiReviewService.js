const groq = require('../config/groq');
const env = require('../config/env');
const AppError = require('../utils/AppError');

/**
 * Wait utility for retrying with backoff
 */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Sanitizes AI response text to strip markdown code blocks if present
 */
const cleanJSONResponse = (text) => {
  if (!text) return '';
  let cleaned = text.trim();
  
  // Remove starting ```json and ending ```
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.substring(7);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.substring(3);
  }

  if (cleaned.endsWith('```')) {
    cleaned = cleaned.substring(0, cleaned.length - 3);
  }

  return cleaned.trim();
};

/**
 * Builds the prompt messages array for Groq
 */
const buildPrompt = (code, language, staticFindings) => {
  const systemPrompt = `You are a world-class senior code reviewer and software engineer.
Analyze the provided code snippet and return a structured JSON report containing code quality findings.
Focus on identifying real bugs, performance optimizations, security vulnerabilities, naming issues, and readability.

Your response MUST be a single, valid JSON object matching this schema exactly:
{
  "overall_score": 85, // number from 0 to 100
  "summary": "High-level summary of the code quality and major issues found.",
  "bugs": [
    { "line": 12, "severity": "critical", "description": "NullPointerException risk when user is null.", "fix": "Check for null: if (user != null) { ... }" }
  ],
  "code_smells": [
    { "line": 24, "description": "Function is too long and performs multiple duties.", "suggestion": "Extract database write logic into writeToDatabase()." }
  ],
  "optimizations": [
    { "description": "Loop scans array multiple times.", "suggestion": "Convert array to Map for O(1) lookups." }
  ],
  "security_issues": [
    { "severity": "critical", "description": "SQL Injection vulnerability via template string concat.", "fix": "Use parameterized query placeholders instead." }
  ],
  "naming_suggestions": [
    { "current": "x", "suggested": "userAge", "reason": "Self-documenting variables improve readability." }
  ],
  "refactoring_tips": [
    "Use ES6 destructuring for properties.",
    "Separate concerns by decoupling logic."
  ],
  "documentation": "Generate a concise docstring or documentation description for the primary function/class in this code.",
  "complexity_notes": "Write a short summary about the cyclomatic complexity, loops, and control structure paths."
}

Ensure all JSON brackets align and keys/string values are properly quoted.
Do NOT output any other text, prefix, or suffix. Return ONLY the JSON object.`;

  const userPrompt = `Language: ${language}
${staticFindings && staticFindings.length > 0 
  ? `Static analysis findings discovered (please augment, explain or add to these, do not repeat them redundantly):\n${JSON.stringify(staticFindings, null, 2)}`
  : ''}

Code to analyze:
\`\`\`${language}
${code}
\`\`\``;

  return { systemPrompt, userPrompt };
};

/**
 * Request Groq LLM Code Review
 */
const getAIReview = async (code, language, staticFindings) => {
  const { systemPrompt, userPrompt } = buildPrompt(code, language, staticFindings);
  const maxRetries = 3;
  let attemptDelay = 2000;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Groq completion call using JSON schema format enforcement
      const completion = await groq.chat.completions.create({
        model: env.GROQ_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.2, // Low temperature for consistent deterministic findings
        max_tokens: 4096,
        response_format: { type: 'json_object' }, // Groq supports JSON Mode
      });

      const responseText = completion.choices[0]?.message?.content;
      if (!responseText) {
        throw new AppError('Groq API returned an empty completion response.', 502, 'AI_EMPTY_RESPONSE');
      }

      const cleanedText = cleanJSONResponse(responseText);
      const parsedReview = JSON.parse(cleanedText);

      return parsedReview;
    } catch (error) {
      console.error(`❌ Groq API attempt ${attempt} failed:`, error.message);
      
      // Handle rate limits (HTTP 429) or transient errors with backoff
      const isRateLimit = error.status === 429 || error.message.includes('429') || error.message.includes('rate limit');
      
      if (attempt < maxRetries && (isRateLimit || error.status >= 500)) {
        console.log(`🔄 Retrying in ${attemptDelay}ms...`);
        await sleep(attemptDelay);
        attemptDelay *= 2; // Double delay
        continue;
      }

      // If it's a parsing error but we got completion, return structured raw text fallback
      if (error instanceof SyntaxError) {
        throw new AppError('AI returned invalid JSON syntax.', 502, 'AI_PARSING_FAILED');
      }

      // Propagate normal operational errors or raise service down error
      throw new AppError('AI Code Review service is currently unavailable. Please try again.', 503, 'AI_SERVICE_DOWN');
    }
  }
};

module.exports = {
  getAIReview,
};
