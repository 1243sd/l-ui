import { spawn } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const workspaceRoot = path.resolve(scriptDirectory, '..', '..');
const runtimeStatePath = path.join(workspaceRoot, '.artifacts', 'consumer-runtime.json');
const pnpmExecutable = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm';
const forwardedArgs = process.argv.slice(2);

if (forwardedArgs.length === 0) {
  throw new Error('consumer-runtime-command requires pnpm arguments, for example: build');
}

const { runtimeDirectory } = JSON.parse(await readFile(runtimeStatePath, 'utf8'));

await new Promise((resolve, reject) => {
  const child = spawn(
    pnpmExecutable,
    ['--dir', runtimeDirectory, '--ignore-workspace', ...forwardedArgs],
    {
      cwd: workspaceRoot,
      stdio: 'inherit',
      shell: process.platform === 'win32'
    }
  );

  child.on('exit', (code) => {
    if (code === 0) {
      resolve();
      return;
    }

    reject(
      new Error(
        `Command failed (${code ?? 'unknown'}): ${pnpmExecutable} --dir ${runtimeDirectory} --ignore-workspace ${forwardedArgs.join(' ')}`
      )
    );
  });

  child.on('error', reject);
});
