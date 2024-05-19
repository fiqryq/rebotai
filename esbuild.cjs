const { build } = require('esbuild');

build({
  bundle: true,
  minify: true,
  sourcemap: true,
  platform: 'node',
  entryPoints: ['index.js'],
  outfile: 'dist/index.js',
  target: 'node20',
  external: ['axios', '@octokit/rest', '@actions/core', '@actions/github'],
}).catch(() => process.exit(1));
