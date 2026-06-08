import { spawn } from 'node:child_process';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const workspaceRoot = path.resolve(scriptDirectory, '..', '..');
const pnpmExecutable = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm';

const steps = [
  { label: 'build', args: ['build'] },
  { label: 'docs:build', args: ['docs:build'] },
  { label: 'pack:check', args: ['pack:check'] },
  { label: 'consumer:build', args: ['consumer:build'] },
  { label: 'test:consumer', args: ['test:consumer'] },
  { label: 'size:check', args: ['size:check'] },
  { label: 'changeset:status', args: ['changeset:status'] }
];

const runStep = (step) =>
  new Promise((resolve, reject) => {
    console.log(`\n[M6 dry-run] Running ${step.label}...`);

    const child = spawn(pnpmExecutable, step.args, {
      cwd: workspaceRoot,
      stdio: 'inherit',
      shell: process.platform === 'win32'
    });

    child.on('exit', (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`[M6 dry-run] ${step.label} failed with exit code ${code ?? 'unknown'}.`));
    });

    child.on('error', reject);
  });

for (const step of steps) {
  await runStep(step);
}

console.log('\nM6 release dry-run passed.');
