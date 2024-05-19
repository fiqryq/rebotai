# Rebotai
Rebotai is a GitHub bot powered by OpenAI that performs code reviews on pull requests.

## Usage
To integrate Rebotai into your GitHub repository, follow these steps:

1. **Add Repository Secrets:**
   Go to your repository settings and add the following secrets:
   - `GH_TOKEN`: Your GitHub token
   - `OPENAI_API_KEY`: Your OpenAI API key

2. **Add Repository Variables:**
   Add the following variables:
   - `MODEL`: The OpenAI model to use (e.g., `gpt-3.5-turbo`)
   - `LANGUAGE`: The preferred language for responses (e.g., `indonesia`)

3. **Add GitHub Actions Workflow:**
   Create a new GitHub Actions workflow file (e.g., `.github/workflows/rebotai.yml`) with the following content:

   ```yaml
   name: Rebotai Code Review
   on:
     issue_comment:
       types: [created]

   jobs: 
     code_review:
       if: >
         github.event.issue.pull_request != null &&
         contains(github.event.comment.body, '/review')
       runs-on: ubuntu-latest
       steps:
         - uses: fiqryq/rebotai@{version}
           with:
             gh-token: ${{ secrets.GH_TOKEN }}
             openai-api-key: ${{ secrets.OPENAI_API_KEY }}
             model: ${{ vars.MODEL }}
             language: ${{ vars.LANGUAGE }}
   ```

## Example Responses
Here are examples of responses in different languages based on the configured `LANGUAGE` variable:

### Japanese
```yaml
language: ${{ vars.LANGUAGE }} # japan
```
![Japanese Response](https://github.com/fiqryq/rebotai/assets/25787603/39253993-82a2-4bbb-9543-335c1bd22f60)

### Indonesian
```yaml
language: ${{ vars.LANGUAGE }} # indonesia
```
![Indonesian Response](https://github.com/fiqryq/rebotai/assets/25787603/129a4459-a49f-4397-b560-b92497da9276)

### English
```yaml
language: ${{ vars.LANGUAGE }} # english
```
![English Response](https://github.com/fiqryq/rebotai/assets/25787603/08b35930-9e99-4319-af9a-1a7500117544)

## Contributing
We welcome contributions! Please feel free to submit issues or pull requests to improve Rebotai.

## License
This project is licensed under the MIT License.
