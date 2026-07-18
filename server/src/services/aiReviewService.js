const groq = require('../config/groq');
const env = require('../config/env');
const AppError = require('../utils/AppError');
const { prisma } = require('../config/db');

/**
 * Wait utility for retrying with backoff
 */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Sliding window of requests in the last 60 seconds to enforce 30 RPM / 1K TPM limits
let slidingWindow = [];

const cleanSlidingWindow = () => {
  const now = Date.now();
  slidingWindow = slidingWindow.filter(r => now - r.time < 60000);
};

const getSlidingTotals = () => {
  cleanSlidingWindow();
  const count = slidingWindow.length;
  const tokens = slidingWindow.reduce((sum, r) => sum + r.tokens, 0);
  return { count, tokens };
};

/**
 * Estimates tokens based on character length (approx 4 characters = 1 token)
 */
const estimateTokens = (promptText, expectedCompletion = 300) => {
  return Math.ceil(promptText.length / 4) + expectedCompletion;
};

/**
 * Checks and enforces daily quotas (12K requests / 100K tokens) via database records
 */
const checkDailyQuotas = async (estimatedTokens) => {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  // Fetch reviews created today
  const reviewsToday = await prisma.review.findMany({
    where: {
      createdAt: {
        gte: startOfDay,
      },
    },
    select: {
      codeContent: true,
      summary: true,
    },
  });

  const dailyRequestCount = reviewsToday.length;
  if (dailyRequestCount >= 12000) {
    throw new AppError('Daily AI review limit reached (Max 12,000 requests/day). Please try again tomorrow.', 429, 'DAILY_LIMIT_EXCEEDED');
  }

  // System prompt is ~140 tokens. User prompt headers are ~40 tokens. Base per request is ~180 tokens.
  const baseTokensPerRequest = 180;
  let dailyTokensUsed = 0;

  reviewsToday.forEach((r) => {
    const codeLen = r.codeContent ? r.codeContent.length : 0;
    const summaryLen = r.summary ? r.summary.length : 0;
    dailyTokensUsed += Math.ceil((codeLen + summaryLen) / 4) + baseTokensPerRequest;
  });

  if (dailyTokensUsed + estimatedTokens > 2000000) {
    throw new AppError('Daily AI token quota exceeded (Max 2,000,000 tokens/day). Please try again tomorrow.', 429, 'DAILY_LIMIT_EXCEEDED');
  }
};

/**
 * Throttles execution if minute limits are temporarily reached
 */
const throttleMinuteLimits = async (estimatedTokens) => {
  const maxWaitTime = 30000; // max wait 30 seconds
  const start = Date.now();

  while (true) {
    const { count, tokens } = getSlidingTotals();

    // 30 RPM and 40K (40,000) TPM limit checks
    if (count < 30 && tokens + estimatedTokens <= 40000) {
      break;
    }

    const elapsed = Date.now() - start;
    if (elapsed >= maxWaitTime) {
      throw new AppError('AI Code Review is temporarily busy. Please wait a minute and try again.', 429, 'RATE_LIMIT_EXCEEDED');
    }

    // Sleep 1 second before rechecking
    await sleep(1000);
  }
};

/**
 * Sanitizes AI response text to strip markdown code blocks if present
 */
const cleanJSONResponse = (text) => {
  if (!text) {return '';}
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
 * Builds a highly compact, token-efficient prompt message array.
 * Saves system tokens to maximize allowed user code input under 1K TPM limit.
 */
const buildPrompt = (code, language, staticFindings) => {
  const systemPrompt = `You are a senior reviewer. Return ONLY a JSON object:
{
  "overall_score": 85,
  "summary": "Brief summary.",
  "bugs": [{"line": 12, "severity": "critical|warning|info", "description": "Msg", "fix": "Fix"}],
  "code_smells": [{"line": 24, "description": "Msg", "suggestion": "Fix"}],
  "optimizations": [{"description": "Msg", "suggestion": "Fix"}],
  "security_issues": [{"severity": "critical|warning", "description": "Msg", "fix": "Fix"}],
  "naming_suggestions": [{"current": "x", "suggested": "y", "reason": "Msg"}],
  "refactoring_tips": ["Tip"],
  "documentation": "Docstring.",
  "complexity_notes": "Complexity overview."
}`;

  const userPrompt = `Language: ${language}
${staticFindings && staticFindings.length > 0 
  ? `Static findings:\n${JSON.stringify(staticFindings, null, 1)}`
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
  
  // 1. Estimate total tokens needed for this request (Prompt + Response)
  const fullPromptText = systemPrompt + userPrompt;
  const estimatedTokens = estimateTokens(fullPromptText, 300); // Expect ~300 token response

  // 2. Fail fast if a single request's code size exceeds the 8K model token limit
  if (estimatedTokens > 8000) {
    throw new AppError('The code is too long for the active model token limit (Max ~28,000 characters of code). Please submit a smaller snippet.', 400, 'CODE_TOO_LARGE');
  }

  // 3. Enforce Daily Limit (12K requests, 100K tokens)
  await checkDailyQuotas(estimatedTokens);

  // 4. Enforce Sliding Window Minute Limit (30 RPM, 1K TPM)
  await throttleMinuteLimits(estimatedTokens);

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
        max_tokens: 600, // Reduced from 4096 to prevent runaway tokens violating minute limits
        response_format: { type: 'json_object' }, // Groq supports JSON Mode
      });

      const responseText = completion.choices[0]?.message?.content;
      if (!responseText) {
        throw new AppError('Groq API returned an empty completion response.', 502, 'AI_EMPTY_RESPONSE');
      }

      const cleanedText = cleanJSONResponse(responseText);
      const parsedReview = JSON.parse(cleanedText);

      // Log successful transaction into sliding window
      const actualCompletionTokens = Math.ceil(cleanedText.length / 4);
      const actualTotalTokens = Math.ceil(fullPromptText.length / 4) + actualCompletionTokens;

      slidingWindow.push({
        time: Date.now(),
        tokens: actualTotalTokens,
      });

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
