const path = require('path');

/**
 * Maps file extensions to programming language strings
 */
const EXTENSION_MAP = {
  '.js': 'javascript',
  '.jsx': 'javascript',
  '.ts': 'typescript',
  '.tsx': 'typescript',
  '.py': 'python',
  '.java': 'java',
  '.cpp': 'c/cpp',
  '.cc': 'c/cpp',
  '.cxx': 'c/cpp',
  '.c': 'c/cpp',
  '.h': 'c/cpp',
  '.hpp': 'c/cpp',
  '.go': 'go',
  '.rb': 'ruby',
  '.rs': 'rust',
  '.swift': 'swift',
  '.kt': 'kotlin',
  '.php': 'php',
  '.sql': 'sql',
  '.html': 'html',
  '.htm': 'html',
  '.css': 'css',
  '.json': 'json',
  '.sh': 'shell',
  '.bash': 'shell',
};

/**
 * Sniffs code content using strict, language-unique signatures.
 * Order of evaluation is calibrated to prevent cross-language misclassifications.
 *
 * @param {string} content
 * @returns {string} detected language or 'unknown'
 */
const sniffContent = (content) => {
  if (!content || typeof content !== 'string') {return 'unknown';}

  const trimmed = content.trim();

  // 1. JSON
  if (/^[\{\[]\s*"[a-zA-Z0-9_-]+"\s*:/m.test(trimmed)) {
    return 'json';
  }

  // 2. HTML / XML
  if (/^\s*<!DOCTYPE\s+html>|^\s*<html|^\s*<body|^\s*<div\b/i.test(trimmed)) {
    return 'html';
  }

  // 3. Shell / Bash
  if (/^#!\/bin\/(?:bash|sh|zsh)/.test(trimmed) || /^\s*(?:export|echo|chmod|chown)\s+[a-zA-Z0-9_$-]+/m.test(trimmed)) {
    return 'shell';
  }

  // 4. SQL
  if (/^\s*(?:SELECT|INSERT\s+INTO|UPDATE|DELETE\s+FROM|CREATE\s+TABLE|ALTER\s+TABLE|DROP\s+TABLE)\b/i.test(trimmed)) {
    return 'sql';
  }

  // 5. PHP
  if (/^\s*<\?php|\$this->|\b\$_POST\b|\b\$_GET\b/i.test(trimmed)) {
    return 'php';
  }

  // 6. Rust
  if (/^\s*fn\s+main\s*\(\s*\)|^\s*pub\s+fn\s+|^\s*use\s+std::|\bprintln!/m.test(trimmed)) {
    return 'rust';
  }

  // 7. Go
  if (/^\s*package\s+[a-zA-Z_]\w*|^\s*func\s+(?:\([^)]+\)\s+)?\w+\s*\(/m.test(trimmed)) {
    return 'go';
  }

  // 8. Java (checked before generic import matching)
  if (
    /^\s*(?:public|private|protected)?\s*(?:final\s+|abstract\s+)?(?:class|interface|enum)\s+[a-zA-Z_]\w*/m.test(trimmed) ||
    /^\s*import\s+(?:java|javax|org|com|net)\./m.test(trimmed) ||
    /^\s*public\s+static\s+void\s+main\s*\(/m.test(trimmed) ||
    /System\.(?:out|err)\.print/m.test(trimmed) ||
    /^\s*@(?:Override|Deprecated|SuppressWarnings|SpringBootApplication|RestController|Autowired)/m.test(trimmed)
  ) {
    return 'java';
  }

  // 9. Kotlin
  if (/^\s*fun\s+main\s*\([^)]*\)|^\s*import\s+kotlin\.|^\s*val\s+\w+\s*:\s*[A-Z]\w*/m.test(trimmed)) {
    return 'kotlin';
  }

  // 10. Swift
  if (/^\s*import\s+(?:UIKit|SwiftUI|Foundation)|^\s*func\s+\w+\s*\([^)]*\)\s*->/m.test(trimmed)) {
    return 'swift';
  }

  // 11. C / C++
  if (
    /^\s*#include\s*<[a-zA-Z0-9_.]+>|^\s*#include\s*"[a-zA-Z0-9_.]+"|^\s*std::(?:cout|cin|endl)|^\s*int\s+main\s*\(/m.test(trimmed)
  ) {
    return 'c/cpp';
  }

  // 12. TypeScript
  if (
    /^\s*interface\s+[A-Z]\w*\s*\{|^\s*type\s+[A-Z]\w*\s*=|:\s*(?:string|number|boolean|any|void)\s*[,;=)]/m.test(trimmed)
  ) {
    return 'typescript';
  }

  // 13. JavaScript
  if (
    /^\s*const\s+\w+\s*=|^\s*let\s+\w+\s*=|^\s*var\s+\w+\s*=|^\s*function\s+[a-zA-Z_]\w*\s*\(|=>|^\s*import\s+.*\s+from\s+['"]/m.test(
      trimmed
    )
  ) {
    return 'javascript';
  }

  // 14. Ruby
  if (/^\s*require\s+['"]|^\s*require_relative|^\s*def\s+\w+|^\s*attr_accessor/m.test(trimmed)) {
    return 'ruby';
  }

  // 15. Python (evaluated after strongly-typed languages)
  if (
    /^\s*def\s+[a-zA-Z_]\w*\s*\(|^\s*from\s+[a-zA-Z_]\w*\s+import|^\s*elif\s+|if\s+__name__\s*==\s*['"]__main__['"]:/m.test(trimmed) ||
    (/^\s*import\s+[a-zA-Z_]\w*/m.test(trimmed) && !/;\s*$/m.test(trimmed)) ||
    /^\s*print\s*\(/m.test(trimmed)
  ) {
    return 'python';
  }

  return 'unknown';
};

/**
 * Detect language based on filename or content heuristics.
 *
 * @param {string} filename - Optional file name/path
 * @param {string} content - Code snippet string
 * @returns {string} language name
 */
const detectLanguage = (filename, content) => {
  if (filename) {
    const ext = path.extname(filename).toLowerCase();
    if (EXTENSION_MAP[ext]) {
      return EXTENSION_MAP[ext];
    }
  }

  // If no filename or extension not mapped, sniff content
  return sniffContent(content);
};

module.exports = {
  detectLanguage,
  EXTENSION_MAP,
};
