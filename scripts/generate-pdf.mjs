/**
 * Generate the printable staff guide PDF from the built site.
 *
 *   npm run pdf
 *
 * Serves the local `dist/` build, drives headless Chrome to print the `/print/`
 * page (so all print CSS — page breaks, cover, tables — is applied), and writes
 * EMS-PLT-Playbook-Staff-Guide.pdf to the project root.
 *
 * Zero npm dependencies: uses Node's built-in http/fs and the Chrome already
 * installed on the machine. Run `npm run build` first (npm run pdf does this).
 */
import { createServer } from 'node:http';
import { readFile, access } from 'node:fs/promises';
import { constants } from 'node:fs';
import { spawn } from 'node:child_process';
import { extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('.', import.meta.url)), '..');
const distDir = join(root, 'dist');
const outFile = join(root, 'EMS-PLT-Playbook-Staff-Guide.pdf');
const printPath = '/print/';

const MIME = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.json': 'application/json',
};

// Candidate Chrome/Chromium locations across platforms.
const CHROME_CANDIDATES = [
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
  process.env.CHROME_PATH,
].filter(Boolean);

async function firstExisting(paths) {
  for (const p of paths) {
    try {
      await access(p, constants.X_OK);
      return p;
    } catch {}
  }
  return null;
}

async function main() {
  // Make sure the build exists.
  try {
    await access(join(distDir, 'print', 'index.html'), constants.R_OK);
  } catch {
    console.error('✗ dist/print/index.html not found — run `npm run build` first.');
    process.exit(1);
  }

  const chrome = await firstExisting(CHROME_CANDIDATES);
  if (!chrome) {
    console.error(
      '✗ Could not find Chrome/Chromium. Install Google Chrome, or set CHROME_PATH to the binary.'
    );
    process.exit(1);
  }

  // Tiny static file server for dist/.
  const server = createServer(async (req, res) => {
    try {
      let urlPath = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
      if (urlPath.endsWith('/')) urlPath += 'index.html';
      // Prevent path traversal.
      const filePath = join(distDir, urlPath);
      if (!filePath.startsWith(distDir)) {
        res.writeHead(403).end();
        return;
      }
      const body = await readFile(filePath);
      res.writeHead(200, { 'Content-Type': MIME[extname(filePath)] ?? 'application/octet-stream' });
      res.end(body);
    } catch {
      res.writeHead(404).end('Not found');
    }
  });

  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const { port } = server.address();
  const url = `http://127.0.0.1:${port}${printPath}`;

  console.log(`→ Rendering ${url}`);
  const args = [
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--no-pdf-header-footer',
    '--run-all-compositor-stages-before-draw',
    '--virtual-time-budget=15000',
    `--print-to-pdf=${outFile}`,
    url,
  ];

  const code = await new Promise((res) => {
    const child = spawn(chrome, args, { stdio: 'ignore' });
    child.on('exit', res);
    child.on('error', () => res(1));
  });

  server.close();

  if (code === 0) {
    console.log(`✓ Wrote ${outFile}`);
  } else {
    console.error(`✗ Chrome exited with code ${code}`);
    process.exit(1);
  }
}

main();
