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
  '.go': 'go',
  '.rb': 'ruby',
  '.html': 'html',
  '.css': 'css',
  '.json': 'json',
  '.sh': 'shell',
};

/**
 * Sniffs the content of code to guess the language.
 *
 * @param {string} content
 * @returns {string} detected language or 'unknown'
 */
const sniffContent = (content) => {
  if (!content || typeof content !== 'string') return 'unknown';

  const trimmed = content.trim();

  // Python patterns
  if (
    /^\s*def\s+[a-zA-Z_]\w*\s*\(|^\s*import\s+[a-zA-Z_]\w*(?:\s*,\s*[a-zA-Z_]\w*)*|^\s*from\s+[a-zA-Z_]\w*\s+import|^\s*print\s*\(.*?\)/m.test(
      trimmed
    )
  ) {
    return 'python';
  }

  // JavaScript patterns
  if (
    /^\s*const\s+\w+\s*=|^\s*let\s+\w+\s*=|^\s*var\s+\w+\s*=|^\s*function\s+[a-zA-Z_]\w*\s*\(|=>/m.test(
      trimmed
    )
  ) {
    return 'javascript';
  }

  // Java patterns
  if (
    /^\s*public\s+class\s+[a-zA-Z_]\w*|^\s*private\s+class\s+[a-zA-Z_]\w*|^\s*import\s+java\./m.test(
      trimmed
    )
  ) {
    return 'java';
  }

  // C++ patterns
  if (
    /^\s*#include\s*<[a-zA-Z0-9_.]+>|^\s*std::cout|^\s*int\s+main\s*\(\s*\)/m.test(
      trimmed
    )
  ) {
    return 'c/cpp';
  }

  // Go patterns
  if (/^\s*package\s+[a-zA-Z_]\w*|^\s*import\s+\(\s*"[^"]+"\s*\)/m.test(trimmed)) {
    return 'go';
  }

  // HTML patterns
  if (/^\s*<!DOCTYPE\s+html>|^\s*<html|^\s*<div/i.test(trimmed)) {
    return 'html';
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
