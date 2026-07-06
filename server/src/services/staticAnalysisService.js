const { exec } = require('child_process');
const util = require('util');
const path = require('path');
const fs = require('fs').promises;
const existsSync = require('fs').existsSync;
const { v4: uuidv4 } = require('uuid');

const execAsync = util.promisify(exec);

// Ensure tmp directory exists
const tempDir = path.join(__dirname, '../../tmp');
if (!existsSync(tempDir)) {
  require('fs').mkdirSync(tempDir, { recursive: true });
}

/**
 * Normalizes ESLint JSON output format to standard envelope.
 */
const normalizeESLintResults = (results) => {
  const findings = [];
  if (!Array.isArray(results) || results.length === 0) return findings;

  const fileResult = results[0];
  if (!fileResult.messages) return findings;

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
  if (!Array.isArray(results)) return findings;

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
 * Runs ESLint on JavaScript/TypeScript code
 */
const runESLint = async (code) => {
  const filename = `${uuidv4()}.js`;
  const filepath = path.join(tempDir, filename);

  await fs.writeFile(filepath, code, 'utf8');

  try {
    // Run npx eslint. Using --no-eslintrc to ignore global/other config conflicts.
    // Specifying basic rules via inline config.
    const eslintCmd = `npx eslint "${filepath}" --format json --no-eslintrc --config ${path.join(
      __dirname,
      '../config/eslint-fallback.json'
    )}`;
    
    // We expect ESLint to exit with 1 if errors are found, so we capture the stdout from the error object too
    let stdout;
    try {
      const result = await execAsync(eslintCmd, { timeout: 15000 });
      stdout = result.stdout;
    } catch (execError) {
      // ESLint returns exit code 1 if checks fail; check if we got output in stdout anyway
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
    // If it's a configuration error or ESLint not installed, return partial parser error
    return [
      {
        source: 'eslint',
        severity: 'info',
        rule: 'eslint-error',
        issue: 'Static check skipped.',
        explanation: 'ESLint was unable to parse this file structure (could be configuration/dependency error).',
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
      // ignore
    }
  }
};

/**
 * Runs Pylint on Python code
 */
const runPylint = async (code) => {
  const filename = `${uuidv4()}.py`;
  const filepath = path.join(tempDir, filename);

  await fs.writeFile(filepath, code, 'utf8');

  try {
    const pylintCmd = `pylint "${filepath}" --output-format=json --disable=C0114,C0115,C0116`;
    
    let stdout;
    try {
      const result = await execAsync(pylintCmd, { timeout: 15000 });
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
        explanation: 'Pylint linter is not installed on this server host or Python execution failed.',
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
 * Main Static Analysis Router
 */
const analyzeCode = async (code, language) => {
  if (!code || !language) return [];

  const lang = language.toLowerCase();

  if (lang === 'javascript' || lang === 'typescript') {
    return await runESLint(code);
  } else if (lang === 'python') {
    return await runPylint(code);
  }

  // No linter supported for this language yet
  return [];
};

module.exports = {
  analyzeCode,
};
