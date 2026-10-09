import esbuild from 'esbuild';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const functionsDir = path.join(rootDir, 'netlify', 'functions');
if (!fs.existsSync(functionsDir)) {
  fs.mkdirSync(functionsDir, { recursive: true });
}

console.log('⚡ Bundling serverless function for Netlify...');

await esbuild.build({
  entryPoints: [path.join(rootDir, 'server', 'serverless.js')],
  outfile: path.join(functionsDir, 'api.cjs'),
  bundle: true,
  platform: 'node',
  target: 'node20',
  format: 'cjs',
  sourcemap: false,
  logLevel: 'info',
  define: {
    'import.meta.url': '""'
  },
  banner: {
    js: '// Cafena Serverless API (Bundled CommonJS)\n'
  }
});

// Copy sql-wasm.wasm into netlify/functions directory for direct co-location
const wasmSrc = path.join(rootDir, 'node_modules', 'sql.js', 'dist', 'sql-wasm.wasm');
const wasmDest = path.join(functionsDir, 'sql-wasm.wasm');
if (fs.existsSync(wasmSrc)) {
  fs.copyFileSync(wasmSrc, wasmDest);
  console.log('✅ Copied sql-wasm.wasm to netlify/functions/');
}

console.log('✅ Serverless function built successfully: netlify/functions/api.cjs');
