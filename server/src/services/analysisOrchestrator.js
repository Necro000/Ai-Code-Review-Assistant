const { prisma } = require('../config/db');
const staticAnalysis = require('./staticAnalysisService');
const aiReview = require('./aiReviewService');
const complexityAnalysis = require('./complexityService');
const AppError = require('../utils/AppError');
const scoringService = require('./scoringService');

/**
 * Maps static analysis linter findings to database format.
 */
const mapStaticFindings = (findings, fileName) => {
  return findings.map((f) => ({
    source: f.source,
    severity: f.severity,
    rule: f.rule,
    issue: f.issue,
    explanation: f.explanation,
    suggestedFix: f.suggestedFix,
    fileName,
    lineNumber: f.lineNumber,
    column: f.column,
  }));
};

/**
 * Maps various AI finding groups to database format.
 */
const mapAIFindings = (aiReport, fileName) => {
  const dbFindings = [];

  // 1. Bugs
  if (Array.isArray(aiReport.bugs)) {
    aiReport.bugs.forEach((b) => {
      dbFindings.push({
        source: 'ai',
        severity: b.severity === 'critical' ? 'error' : b.severity === 'info' ? 'info' : 'warning',
        rule: 'bug-detection',
        issue: b.description || 'Potential runtime bug detected.',
        explanation: b.description,
        suggestedFix: b.fix,
        fileName,
        lineNumber: parseInt(b.line, 10) || null,
        column: 1,
      });
    });
  }

  // 2. Code Smells
  if (Array.isArray(aiReport.code_smells)) {
    aiReport.code_smells.forEach((s) => {
      dbFindings.push({
        source: 'ai',
        severity: 'warning',
        rule: 'code-smell',
        issue: s.description || 'Code style or structure smell.',
        explanation: s.description,
        suggestedFix: s.suggestion,
        fileName,
        lineNumber: parseInt(s.line, 10) || null,
        column: 1,
      });
    });
  }

  // 3. Optimizations
  if (Array.isArray(aiReport.optimizations)) {
    aiReport.optimizations.forEach((o) => {
      dbFindings.push({
        source: 'ai',
        severity: 'info',
        rule: 'performance-optimization',
        issue: o.description || 'Performance enhancement suggestion.',
        explanation: o.description,
        suggestedFix: o.suggestion,
        fileName,
        lineNumber: parseInt(o.line, 10) || null,
        column: 1,
      });
    });
  }

  // 4. Security Issues
  if (Array.isArray(aiReport.security_issues)) {
    aiReport.security_issues.forEach((sec) => {
      dbFindings.push({
        source: 'ai',
        severity: sec.severity === 'critical' ? 'error' : 'warning',
        rule: 'security-vulnerability',
        issue: sec.description || 'Potential security issue.',
        explanation: sec.description,
        suggestedFix: sec.fix,
        fileName,
        lineNumber: parseInt(sec.line, 10) || null,
        column: 1,
      });
    });
  }

  // 5. Naming Suggestions
  if (Array.isArray(aiReport.naming_suggestions)) {
    aiReport.naming_suggestions.forEach((n) => {
      dbFindings.push({
        source: 'ai',
        severity: 'info',
        rule: 'naming-convention',
        issue: `Rename variable/function "${n.current}" to "${n.suggested}".`,
        explanation: n.reason || 'Improves legibility and self-documentation.',
        suggestedFix: `Replace occurrences of "${n.current}" with "${n.suggested}".`,
        fileName,
        lineNumber: parseInt(n.line, 10) || null,
        column: 1,
      });
    });
  }

  // 6. Refactoring Tips
  if (Array.isArray(aiReport.refactoring_tips)) {
    aiReport.refactoring_tips.forEach((tip, index) => {
      dbFindings.push({
        source: 'ai',
        severity: 'info',
        rule: 'refactoring-tip',
        issue: `Refactoring Suggestion ${index + 1}: ${tip}`,
        explanation: tip,
        suggestedFix: null,
        fileName,
        lineNumber: null,
        column: null,
      });
    });
  }

  return dbFindings;
}

/**
 * Coordinate full multi-stage code review pipeline.
 *
 * @param {string} code - Target code string
 * @param {string} language - Code language
 * @param {string} projectId - Project identifier
 * @param {string} fileName - File name representation
 * @returns {object} review DB model object
 */
const runCodeAnalysis = async (code, language, projectId, fileName = 'snippet.txt') => {
  // Stage 0: Complexity Analysis (runs first, locally, non-blocking)
  const complexity = complexityAnalysis.analyzeCodeStructure(code, language);

  // Stage 1: Static Analysis
  let staticFindings = [];
  try {
    staticFindings = await staticAnalysis.analyzeCode(code, language);
  } catch (error) {
    console.warn(`⚠️ Static linter failed for ${fileName}. Skipping linter step.`, error.message);
  }

  // Stage 2: AI Review
  let aiReport;
  try {
    aiReport = await aiReview.getAIReview(code, language, staticFindings);
  } catch (error) {
    console.error('❌ AI review stage failed:', error.message);
    
    // If AI fails but we have static findings, return static-only results
    if (staticFindings.length > 0) {
      aiReport = {
        overall_score: 70, // default placeholder
        summary: 'Static analysis check succeeded. AI Review failed (API timeout/quota exceeded).',
      };
    } else {
      // Re-raise if everything failed
      throw error;
    }
  }

  // Formulate the database nested list of findings
  const staticDbFindings = mapStaticFindings(staticFindings, fileName);
  const aiDbFindings = mapAIFindings(aiReport, fileName);
  const allFindings = [...staticDbFindings, ...aiDbFindings];

  // Combine results with penalty-adjusted score
  const { score: overallScore } = scoringService.computeScore(
    aiReport.overall_score,
    staticFindings,
    allFindings
  );
  const summary = aiReport.summary || 'Code review completed with minor linter warnings.';
  
  // Format description of complexity to append to AI summary (satisfying Phase 4 summary requirements)
  const complexityText = `\n\n**Complexity Metrics:**\nLines of Code: ${complexity.linesOfCode} | Cyclomatic Complexity: ${complexity.cyclomaticComplexity} (${complexity.complexityRating}).`;
  const enrichedSummary = `${summary}${complexityText}`;

  // Save the full transaction report to database
  const review = await prisma.review.create({
    data: {
      projectId,
      reviewType: staticFindings.length > 0 ? 'combined' : 'ai_only',
      overallScore,
      summary: enrichedSummary,
      codeContent: code,
      language,
      findings: {
        create: allFindings,
      },
    },
    include: {
      findings: true,
    },
  });

  return { review, complexity };
};

module.exports = {
  runCodeAnalysis,
};
