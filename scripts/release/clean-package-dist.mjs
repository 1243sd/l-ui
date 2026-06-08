import { rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import process from 'node:process';

const packageName = process.argv[2];

if (!packageName) {
  console.error('Usage: node scripts/release/clean-package-dist.mjs <package-name>');
  process.exit(1);
}

const workspaceRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const distPath = path.join(workspaceRoot, 'packages', packageName, 'dist');

await rm(distPath, { recursive: true, force: true });
