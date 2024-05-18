const core = require('@actions/core');
const github = require('@actions/github');
const { Octokit } = require('@octokit/rest');
const axios = require('axios');

const githubToken = process.env.GH_TOKEN;
const openaiApiKey = process.env.OPENAI_API_KEY;

const octokit = new Octokit({ auth: githubToken });

const reviewCodeWithOpenAI = async (code) => {
  const response = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that reviews code.',
        },
        {
          role: 'user',
          content: `Review the following code and provide feedback. Additionally, please offer your best suggestions for improvement:\n\n${code}`,
        },
      ],
      max_tokens: 150,
      n: 1,
      stop: null,
      temperature: 0.7,
    },
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${openaiApiKey}`,
      },
    }
  );
  return response.data.choices[0].message.content.trim();
};
const run = async () => {
  try {
    const context = github.context;
    const event = context.eventName;
    const payload = context.payload;

    if (
      event === 'issue_comment' &&
      payload.action === 'created' &&
      payload.comment &&
      payload.issue
    ) {
      const comment = payload.comment.body;
      const owner = payload.repository.owner.login;
      const repo = payload.repository.name;
      const issueNumber = payload.issue.number;

      if (comment.trim() === '/review' && payload.issue.pull_request) {
        const pullRequestUrl = payload.issue.pull_request.url;
        const pullRequestNumber = pullRequestUrl.split('/').pop();

        console.log(
          `Fetching files for PR ${pullRequestNumber} in repo ${owner}/${repo}`
        );

        try {
          const { data: files } = await octokit.pulls.listFiles({
            owner,
            repo,
            pull_number: pullRequestNumber,
          });

          let reviewComments = '';

          for (const file of files) {
            if (file.patch) {
              const review = await reviewCodeWithOpenAI(file.patch);
              reviewComments += `### Review for ${file.filename}:\n\n${review}\n\n`;
            }
          }

          await octokit.issues.createComment({
            owner,
            repo,
            issue_number: issueNumber,
            body: reviewComments,
          });
        } catch (error) {
          console.error(`Error fetching PR files: ${error.message}`);
          if (error.response) {
            console.error(
              `Error details: ${JSON.stringify(error.response.data, null, 2)}`
            );
          }
          core.setFailed(`Error fetching PR files: ${error.message}`);
        }
      }
    }
  } catch (error) {
    core.setFailed(error.message);
    if (error.response) {
      core.setFailed(
        `Error details: ${JSON.stringify(error.response.data, null, 2)}`
      );
    }
  }
};

run();
