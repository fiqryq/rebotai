## rebotai
A GitHub bot powered by OpenAI for code review on pull requests.

## usage
```yaml
name: Code review using rebotai
on:
  issue_comment:
    types: [created]

jobs: 
  test_code_review:
    if: >
      github.event.issue.pull_request != null &&
      contains(github.event.comment.body, '/review')
    runs-on: ubuntu-latest
    steps:
      - uses: fiqryq/rebotai@{version}
        with:
          gh-token: ${{ secrets.GH_TOKEN }}
          openai-api-key: ${{ secrets.OPENAI_API_KEY }}
```

## example response 
![CleanShot 2024-05-19 at 13 04 40](https://github.com/fiqryq/rebotai/assets/25787603/3cad6a1b-6f1f-4d85-9eb2-86a36acacc8b)
