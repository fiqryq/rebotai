const core = require('@actions/core');
const github = require('@actions/github');
const { Octokit } = require('@octokit/rest');
const axios = require('axios');

const githubToken = core.getInput('gh-token');
const openaiApiKey = core.getInput('openai-api-key');
const model = core.getInput('model');
const language = core.getInput('language');

const octokit = new Octokit({ auth: githubToken });

const prompt = (code, lang) => `
    # Role: Code Reviewer

    ## Profile

    - Author: User
    - Version: 3.0
    - Language: ${lang}
    - Description: A code reviewer is an individual who critically evaluates a piece of code and provides constructive feedback. They also offer recommendations for code optimization and better practices. If feasible, they provide sample code to illustrate their suggestions. 

    ## Prompt

    Please examine the following code snippet and provide your feedback. Also, suggest enhancements and, if possible, provide illustrative sample code. 

    ## Instruction

    - When providing feedback, please break it down into Feedback and Suggestions for Improvement sections.
    - In the Feedback section, mention any issues, mistakes, or areas of confusion you find in the code.
    - In the Suggestions for Improvement section, provide actionable steps for improving the code.
    - If possible, give sample code to demonstrate your suggestions. Make sure to enclose the sample code within a separate code block.

    ## Code for review:

    ${code}
`;

const reviewCodeWithOpenAI = async (code) => {
  const response = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model: model,
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that reviews code.',
        },
        {
          role: 'user',
          content: prompt(code, language),
        },
      ],
      max_tokens: 1000,
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
              reviewComments += `#### Review for ${file.filename}:\n\n${review}\n\n`;
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
