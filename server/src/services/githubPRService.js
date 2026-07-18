const { Octokit } = require('@octokit/rest');
const { detectLanguage } = require('../utils/languageDetector');

const getOctokit = () => new Octokit({ auth: process.env.GITHUB_ACCESS_TOKEN || undefined });

const fetchPRFiles = async (owner, repo, pullNumber) => {
  const octokit = getOctokit();

  const { data: files } = await octokit.pulls.listFiles({
    owner,
    repo,
    pull_number: parseInt(pullNumber, 10),
  });

  const results = [];
  for (const file of files) {
    // Only analyze added, modified, or renamed files containing active code patches
    if (file.status === 'removed' || !file.patch) {continue;}

    let code = '';
    try {
      const response = await octokit.repos.getContent({
        owner,
        repo,
        path: file.filename,
        ref: file.sha || undefined
      });

      if (response.data && response.data.content) {
        code = Buffer.from(response.data.content, 'base64').toString('utf8');
      } else {
        code = file.patch;
      }
    } catch (err) {
      // Fallback to diff patch if unable to retrieve whole file content (e.g. size limits)
      code = file.patch;
    }

    const language = detectLanguage(file.filename, code);
    results.push({ fileName: file.filename, code, language });
  }

  return results;
};

module.exports = { fetchPRFiles };
