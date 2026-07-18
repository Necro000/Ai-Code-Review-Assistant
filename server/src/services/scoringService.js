/**
 * Computes a penalty-adjusted quality score.
 * AI score is the baseline; severity findings apply deductions.
 */
const computeScore = (aiScore, _staticFindings = [], allFindings = []) => {
  let score = Math.max(0, Math.min(100, parseFloat(aiScore) || 70));

  const errorCount   = allFindings.filter(f => f.severity === 'error').length;
  const warningCount = allFindings.filter(f => f.severity === 'warning').length;

  score -= errorCount   * 3; // -3 pts per error
  score -= warningCount * 1; // -1 pt per warning
  score = Math.max(0, Math.min(100, Math.round(score)));

  let grade;
  if (score >= 90) {grade = 'A';}
  else if (score >= 80) {grade = 'B';}
  else if (score >= 70) {grade = 'C';}
  else if (score >= 60) {grade = 'D';}
  else {grade = 'F';}

  return { score, grade };
};

module.exports = { computeScore };
