/**
 * Checks if a line is a comment in JavaScript, Python, Java, C++, Go, Ruby.
 */
const isCommentLine = (line, lang) => {
  const trimmed = line.trim();
  if (trimmed.length === 0) {return false;}

  const isHashComment = trimmed.startsWith('#');
  const isSlashComment = trimmed.startsWith('//');
  const isBlockComment = trimmed.startsWith('/*') || trimmed.startsWith('*') || trimmed.startsWith('*/');

  if (lang === 'python' || lang === 'ruby') {
    return isHashComment;
  }

  // C-style comments (JS, TS, C++, Java, Go)
  return isSlashComment || isBlockComment;
};

/**
 * Counts function definitions based on regex patterns per language.
 */
const countFunctions = (code, lang) => {
  if (!code) {return 0;}
  
  let matches = [];
  
  if (lang === 'python') {
    // def my_func(x):
    matches = code.match(/^\s*def\s+[a-zA-Z_]\w*\s*\(/gm);
  } else if (lang === 'ruby') {
    // def my_func
    matches = code.match(/^\s*def\s+[a-zA-Z_]\w*/gm);
  } else {
    // JS/TS, Java, Go, C++
    // function name() or const x = () => or public void name()
    const traditionalFunc = code.match(/function\s+[a-zA-Z_]\w*\s*\(/g) || [];
    const arrowFunc = code.match(/=>/g) || [];
    const methodDef = code.match(/(?:public|private|protected|static|\s)\s+[a-zA-Z_<>]+\s+[a-zA-Z_]\w*\s*\([^)]*\)\s*(?:throws|{)/g) || [];
    
    return traditionalFunc.length + arrowFunc.length + methodDef.length;
  }

  return matches ? matches.length : 0;
};

/**
 * Counts class definitions based on regex.
 */
const countClasses = (code) => {
  if (!code) {return 0;}
  // class MyClass
  const matches = code.match(/^\s*class\s+[a-zA-Z_]\w*/gm);
  return matches ? matches.length : 0;
};

/**
 * Calculates cyclomatic complexity by counting control structures.
 */
const calculateCyclomaticComplexity = (code, lang) => {
  if (!code) {return 1;}

  let complexity = 1; // Base complexity

  const lines = code.split('\n');

  lines.forEach((line) => {
    // Ignore lines that are comments
    if (isCommentLine(line, lang)) {return;}

    // Decision keywords based on language
    if (lang === 'python') {
      // Python decision operators
      const matches = line.match(/\b(if|elif|for|while|except|and|or)\b/g);
      if (matches) {complexity += matches.length;}
    } else {
      // JS, TS, Java, C++, Go: look for control keywords, logic gates and ternary
      const keywords = line.match(/\b(if|for|while|catch|case)\b/g) || [];
      const logicGates = line.match(/(&&|\|\|)/g) || [];
      const ternaries = line.match(/\?/g) || [];

      complexity += keywords.length + logicGates.length + ternaries.length;
    }
  });

  return complexity;
};

/**
 * Provides a rating scale description for total cyclomatic complexity.
 */
const getComplexityRating = (cc) => {
  if (cc <= 5) {return 'Low — Clean, testable, and highly readable.';}
  if (cc <= 10) {return 'Moderate — Simple logic with minor pathing. Easy to test.';}
  if (cc <= 20) {return 'High — Complex structure with deep branches. Consider refactoring.';}
  return 'Very High — Extremely complex. High risk of bugs. Refactoring required.';
};

/**
 * Run structural code analysis
 */
const analyzeCodeStructure = (code, language) => {
  const lang = language ? language.toLowerCase() : 'unknown';
  const lines = code.split('\n');
  
  // Calculate raw LOC
  const loc = lines.filter((line) => line.trim() && !isCommentLine(line, lang)).length;

  const fnCount = countFunctions(code, lang);
  const classCount = countClasses(code);
  const cc = calculateCyclomaticComplexity(code, lang);

  const avgCC = fnCount > 0 ? parseFloat((cc / fnCount).toFixed(2)) : cc;

  return {
    linesOfCode: loc,
    totalLines: lines.length,
    functionCount: fnCount,
    classCount,
    cyclomaticComplexity: cc,
    averageComplexityPerFunction: avgCC,
    complexityRating: getComplexityRating(cc),
  };
};

module.exports = {
  analyzeCodeStructure,
};
