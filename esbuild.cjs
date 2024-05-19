const { build } = require('esbuild');
const fs = require('fs');

// Read GitHub secrets from environment variables
const ghToken = process.env.GH_TOKEN;
const openaiApiKey = process.env.OPENAI_API_KEY;

// Check if secrets are defined
if (!ghToken || !openaiApiKey) {
  console.error('GitHub token or OpenAI API key is not defined');
  process.exit(1);
}

// Write secrets to a file to be accessed by the build process
fs.writeFileSync(
  'secrets.json',
  JSON.stringify({ GH_TOKEN: ghToken, OPENAI_API_KEY: openaiApiKey })
);

build({
  bundle: true,
  minify: true,
  sourcemap: true,
  platform: 'node',
  entryPoints: ['index.js'],
  outfile: 'dist/index.js',
  target: 'node20',
  // Inject environment variables from GitHub secrets into build process
  define: {
    'process.env.GH_TOKEN': JSON.stringify(ghToken),
    'process.env.OPENAI_API_KEY': JSON.stringify(openaiApiKey),
  },
}).catch(() => process.exit(1));
