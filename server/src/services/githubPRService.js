const { Octokit } = require('@octokit/rest');
const { detectLanguage } = require('../utils/languageDetector');
const AppError = require('../utils/AppError');

const getOctokit = () => new Octokit({ auth: process.env.GITHUB_ACCESS_TOKEN || undefined });

/**
 * Cleans git patch diff lines by stripping leading + / - / @@ diff markers
 */
const cleanPatchDiff = (patch) => {
  if (!patch) {return '';}
  return patch
    .split('\n')
    .filter((line) => !line.startsWith('@@') && !line.startsWith('---') && !line.startsWith('+++'))
    .map((line) => {
      if (line.startsWith('+') || line.startsWith(' ')) {return line.slice(1);}
      if (line.startsWith('-')) {return '';}
      return line;
    })
    .join('\n');
};

const fetchPRFiles = async (owner, repo, pullNumber) => {
  const octokit = getOctokit();

  let prData;
  try {
    const response = await octokit.pulls.get({
      owner,
      repo,
      pull_number: parseInt(pullNumber, 10),
    });
    prData = response.data;
  } catch (err) {
    if (err.status === 404) {
      throw new AppError(`Pull Request #${pullNumber} in "${owner}/${repo}" was not found or is private.`, 404, 'PR_NOT_FOUND');
    }
    if (err.status === 403) {
      throw new AppError('GitHub API rate limit exceeded. Please configure GITHUB_ACCESS_TOKEN in server .env.', 403, 'RATE_LIMIT_EXCEEDED');
    }
    throw new AppError(err.message || 'Failed to fetch Pull Request details from GitHub.', err.status || 500, 'GITHUB_API_ERROR');
  }

  const headSha = prData.head.sha;

  let files;
  try {
    const response = await octokit.pulls.listFiles({
      owner,
      repo,
      pull_number: parseInt(pullNumber, 10),
      per_page: 50,
    });
    files = response.data;
  } catch (err) {
    throw new AppError('Failed to list files for this Pull Request.', 500, 'GITHUB_API_ERROR');
  }

  const results = [];
  for (const file of files) {
    // Skip removed files
    if (file.status === 'removed') {continue;}

    let code = '';
    try {
      // Fetch full file content at the PR head commit SHA ref
      const response = await octokit.repos.getContent({
        owner,
        repo,
        path: file.filename,
        ref: headSha,
      });

      if (response.data && response.data.content) {
        code = Buffer.from(response.data.content, 'base64').toString('utf8');
      }
    } catch (err) {
      // If fetching full file content at headSha fails, clean git patch diff
      if (file.patch) {
        code = cleanPatchDiff(file.patch);
      }
    }

    if (!code || code.trim() === '') {continue;}

    const language = detectLanguage(file.filename, code);
    results.push({ fileName: file.filename, code, language });
  }

  return results;
};

module.exports = { fetchPRFiles };
