const { exec } = require('child_process');
const util = require('util');
const path = require('path');
const fs = require('fs').promises;
const existsSync = require('fs').existsSync;
const { v4: uuidv4 } = require('uuid');

const execAsync = util.promisify(exec);

// Paths
const tempDir = path.join(__dirname, '../../tmp');

// Resolve local ESLint v8 binary — installed in server/node_modules
// __dirname is server/src/services → go up 2 levels → server root
const serverRoot = path.resolve(__dirname, '../..');
const eslintBin = path.join(serverRoot, 'node_modules', 'eslint', 'bin', 'eslint.js');
const eslintConfig = path.join(__dirname, '../config/eslint-fallback.json');

// Ensure tmp directory exists
if (!existsSync(tempDir)) {
  require('fs').mkdirSync(tempDir, { recursive: true });
}

/**
 * Normalizes ESLint JSON output format to standard envelope.
 */
const normalizeESLintResults = (results) => {
  const findings = [];
  if (!Array.isArray(results) || results.length === 0) {return findings;}

  const fileResult = results[0];
  if (!fileResult.messages) {return findings;}

  fileResult.messages.forEach((msg) => {
    findings.push({
      source: 'eslint',
      severity: msg.severity === 2 ? 'error' : 'warning',
      rule: msg.ruleId || 'syntax-error',
      issue: msg.message,
      explanation: msg.message,
      suggestedFix: msg.fix ? 'Fix available in editor.' : null,
      lineNumber: msg.line || 1,
      column: msg.column || 1,
    });
  });

  return findings;
};

/**
 * Normalizes Pylint JSON output format to standard envelope.
 */
const normalizePylintResults = (results) => {
  const findings = [];
  if (!Array.isArray(results)) {return findings;}

  results.forEach((msg) => {
    // Pylint type mapping:
    // convention, refactor -> info
    // warning -> warning
    // error, fatal -> error
    let severity = 'info';
    if (msg.type === 'error' || msg.type === 'fatal') {
      severity = 'error';
    } else if (msg.type === 'warning') {
      severity = 'warning';
    }

    findings.push({
      source: 'pylint',
      severity,
      rule: msg.symbol || msg['message-id'] || 'pylint-check',
      issue: msg.message,
      explanation: `${msg.obj ? `In context: "${msg.obj}". ` : ''}${msg.message}`,
      suggestedFix: null, // Pylint doesn't supply auto-fix details in JSON format
      lineNumber: msg.line || 1,
      column: msg.column || 1,
    });
  });

  return findings;
};

/**
 * Runs ESLint (v8, local node_modules) on JavaScript/TypeScript code.
 * Uses local binary directly to avoid global ESLint version conflicts.
 */
const runESLint = async (code) => {
  const filename = `${uuidv4()}.js`;
  const filepath = path.join(tempDir, filename);

  await fs.writeFile(filepath, code, 'utf8');

  try {
    // Use local node_modules ESLint v8 binary with explicit config file
    // --no-eslintrc disables all project-level configs, --config applies only our rules
    const eslintCmd = `node "${eslintBin}" "${filepath}" --format json --no-eslintrc --config "${eslintConfig}"`;

    let stdout;
    try {
      const result = await execAsync(eslintCmd, { timeout: 20000, shell: true });
      stdout = result.stdout;
    } catch (execError) {
      // ESLint returns exit code 1 when findings exist — stdout still has JSON results
      if (execError.stdout) {
        stdout = execError.stdout;
      } else {
        throw execError;
      }
    }

    const parsed = JSON.parse(stdout);
    return normalizeESLintResults(parsed);
  } catch (error) {
    console.warn('⚠️ ESLint execution issue:', error.message);
    return [
      {
        source: 'eslint',
        severity: 'info',
        rule: 'eslint-error',
        issue: 'Static check skipped.',
        explanation: 'ESLint was unable to analyze this code (configuration or parse error).',
        suggestedFix: null,
        lineNumber: 1,
        column: 1,
      },
    ];
  } finally {
    // Always clean up temp file
    try {
      await fs.unlink(filepath);
    } catch (e) {
      // ignore cleanup errors
    }
  }
};

/**
 * Runs Pylint on Python code.
 */
const runPylint = async (code) => {
  const filename = `${uuidv4()}.py`;
  const filepath = path.join(tempDir, filename);

  await fs.writeFile(filepath, code, 'utf8');

  try {
    const pylintCmd = `pylint "${filepath}" --output-format=json --disable=C0114,C0115,C0116`;

    let stdout;
    try {
      const result = await execAsync(pylintCmd, { timeout: 20000, shell: true });
      stdout = result.stdout;
    } catch (execError) {
      // Pylint returns exit code flags on findings; capture stdout
      if (execError.stdout) {
        stdout = execError.stdout;
      } else {
        throw execError;
      }
    }

    const parsed = JSON.parse(stdout);
    return normalizePylintResults(parsed);
  } catch (error) {
    console.warn('⚠️ Pylint execution issue:', error.message);
    return [
      {
        source: 'pylint',
        severity: 'info',
        rule: 'pylint-error',
        issue: 'Pylint check skipped.',
        explanation: 'Pylint is not installed on this server or Python execution failed.',
        suggestedFix: null,
        lineNumber: 1,
        column: 1,
      },
    ];
  } finally {
    try {
      await fs.unlink(filepath);
    } catch (e) {
      // ignore cleanup errors
    }
  }
};

/**
 * Normalizes Checkstyle XML output format to standard envelope.
 */
const normalizeCheckstyleResults = (xmlString) => {
  const findings = [];
  if (!xmlString) {return findings;}

  const errorRegex = /<error\s+line="(\d+)"\s*(?:column="(\d+)"\s*)?severity="([^"]+)"\s+message="([^"]+)"\s+source="([^"]+)"/g;
  let match;
  while ((match = errorRegex.exec(xmlString)) !== null) {
    const line = parseInt(match[1], 10) || 1;
    const col = parseInt(match[2], 10) || 1;
    let severity = 'warning';
    if (match[3] === 'error') {
      severity = 'error';
    } else if (match[3] === 'info') {
      severity = 'info';
    }

    findings.push({
      source: 'checkstyle',
      severity,
      rule: match[5].split('.').pop() || 'checkstyle-rule',
      issue: match[4],
      explanation: match[4],
      suggestedFix: null,
      lineNumber: line,
      column: col,
    });
  }
  return findings;
};

/**
 * Normalizes Cppcheck XML output format to standard envelope.
 */
const normalizeCppcheckResults = (xmlString) => {
  const findings = [];
  if (!xmlString) {return findings;}

  const errorBlockRegex = /<error\s+id="([^"]+)"\s+severity="([^"]+)"\s+msg="([^"]+)"[^>]*>([\s\S]*?)<\/error>/g;
  let match;
  while ((match = errorBlockRegex.exec(xmlString)) !== null) {
    const rule = match[1];
    let severity = 'warning';
    if (match[2] === 'error') {
      severity = 'error';
    } else if (match[2] === 'style' || match[2] === 'performance' || match[2] === 'portability') {
      severity = 'warning';
    } else if (match[2] === 'information') {
      severity = 'info';
    }

    const explanation = match[3];
    const locRegex = /<location\s+[^>]*line="(\d+)"[^>]*\/>/;
    const locMatch = locRegex.exec(match[4]);
    const line = locMatch ? parseInt(locMatch[1], 10) : 1;

    findings.push({
      source: 'cppcheck',
      severity,
      rule,
      issue: explanation,
      explanation,
      suggestedFix: null,
      lineNumber: line,
      column: 1,
    });
  }
  return findings;
};

/**
 * Runs Checkstyle on Java code.
 */
const runCheckstyle = async (code) => {
  const filename = `${uuidv4()}.java`;
  const filepath = path.join(tempDir, filename);

  await fs.writeFile(filepath, code, 'utf8');

  try {
    const jarPath = process.env.CHECKSTYLE_JAR || 'checkstyle.jar';
    const cmd = `java -jar "${jarPath}" -c /google_checks.xml -f xml "${filepath}"`;

    let stdout = '';
    try {
      const result = await execAsync(cmd, { timeout: 30000, shell: true });
      stdout = result.stdout;
    } catch (execError) {
      if (execError.stdout) {
        stdout = execError.stdout;
      } else {
        throw execError;
      }
    }

    return normalizeCheckstyleResults(stdout);
  } catch (error) {
    console.warn('⚠️ Checkstyle execution issue:', error.message);
    return [
      {
        source: 'checkstyle',
        severity: 'info',
        rule: 'checkstyle-error',
        issue: 'Static check skipped.',
        explanation: 'Checkstyle linter was unable to analyze this code or Java is not installed.',
        suggestedFix: null,
        lineNumber: 1,
        column: 1,
      },
    ];
  } finally {
    try {
      await fs.unlink(filepath);
    } catch (e) {
      // ignore
    }
  }
};

/**
 * Runs Cppcheck on C/C++ code.
 */
const runCppcheck = async (code) => {
  const filename = `${uuidv4()}.cpp`;
  const filepath = path.join(tempDir, filename);

  await fs.writeFile(filepath, code, 'utf8');

  try {
    const cmd = `cppcheck --enable=all --xml "${filepath}"`;

    let stderr = '';
    try {
      const result = await execAsync(cmd, { timeout: 30000, shell: true });
      stderr = result.stderr;
    } catch (execError) {
      if (execError.stderr) {
        stderr = execError.stderr;
      } else {
        throw execError;
      }
    }

    return normalizeCppcheckResults(stderr);
  } catch (error) {
    console.warn('⚠️ Cppcheck execution issue:', error.message);
    return [
      {
        source: 'cppcheck',
        severity: 'info',
        rule: 'cppcheck-error',
        issue: 'Static check skipped.',
        explanation: 'Cppcheck was unable to analyze this code or cppcheck binary is not installed.',
        suggestedFix: null,
        lineNumber: 1,
        column: 1,
      },
    ];
  } finally {
    try {
      await fs.unlink(filepath);
    } catch (e) {
      // ignore
    }
  }
};

/**
 * Main Static Analysis Router — dispatches to the correct linter by language.
 */
const analyzeCode = async (code, language) => {
  if (!code || !language) {return [];}

  const lang = language.toLowerCase();

  if (lang === 'javascript' || lang === 'typescript') {
    return await runESLint(code);
  } else if (lang === 'python') {
    return await runPylint(code);
  } else if (lang === 'java') {
    return await runCheckstyle(code);
  } else if (lang === 'c/cpp' || lang === 'cpp' || lang === 'c') {
    return await runCppcheck(code);
  }

  // No linter available for this language
  return [];
};

module.exports = {
  analyzeCode,
};
