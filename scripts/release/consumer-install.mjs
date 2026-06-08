import { spawn } from 'node:child_process';
import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const workspaceRoot = path.resolve(scriptDirectory, '..', '..');
const templateDirectory = path.join(workspaceRoot, 'apps', 'consumer-smoke');
const artifactsDirectory = path.join(workspaceRoot, '.artifacts');
const runtimeDirectory = path.join(artifactsDirectory, 'consumer-smoke-runtime');
const tarballDirectory = path.join(artifactsDirectory, 'consumer-tarballs');
const pnpmExecutable = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm';

const releasePackages = [
  {
    name: '@lolita-ui/tokens',
    directory: path.join(workspaceRoot, 'packages', 'tokens'),
    direct: false
  },
  {
    name: '@lolita-ui/utils',
    directory: path.join(workspaceRoot, 'packages', 'utils'),
    direct: false
  },
  {
    name: '@lolita-ui/theme',
    directory: path.join(workspaceRoot, 'packages', 'theme'),
    direct: true
  },
  {
    name: '@lolita-ui/components-vue',
    directory: path.join(workspaceRoot, 'packages', 'components-vue'),
    direct: true
  },
  {
    name: '@lolita-ui/pro-vue',
    directory: path.join(workspaceRoot, 'packages', 'pro-vue'),
    direct: true
  }
];

const runCommand = (command, args, cwd) =>
  new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd,
      stdio: 'inherit',
      shell: process.platform === 'win32'
    });

    child.on('exit', (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(
        new Error(
          `Command failed (${code ?? 'unknown'}): ${command} ${args.join(' ')}`
        )
      );
    });

    child.on('error', reject);
  });

const readJson = async (filePath) =>
  JSON.parse(await readFile(filePath, 'utf8'));

const toTarballBaseName = (packageName) =>
  packageName.replace(/^@/, '').replace(/\//g, '-');

const toFileSpecifier = (fromDirectory, targetPath) =>
  `file:${path.relative(fromDirectory, targetPath).split(path.sep).join('/')}`;

const packReleasePackage = async ({ name, directory, direct }) => {
  const manifest = await readJson(path.join(directory, 'package.json'));
  const tarballName = `${toTarballBaseName(manifest.name)}-${manifest.version}.tgz`;
  const tarballPath = path.join(tarballDirectory, tarballName);

  await runCommand(pnpmExecutable, ['pack', '--pack-destination', tarballDirectory], directory);

  return {
    name,
    direct,
    tarballPath
  };
};

const installConsumerDependencies = async (tarballs) => {
  const packageJsonPath = path.join(runtimeDirectory, 'package.json');
  const packageJson = await readJson(packageJsonPath);
  const overrides = Object.fromEntries(
    tarballs.map(({ name, tarballPath }) => [
      name,
      toFileSpecifier(runtimeDirectory, tarballPath)
    ])
  );

  packageJson.dependencies = {
    ...packageJson.dependencies,
    ...Object.fromEntries(
      tarballs.filter(({ direct }) => direct).map(({ name, tarballPath }) => [
        name,
        toFileSpecifier(runtimeDirectory, tarballPath)
      ])
    )
  };
  packageJson.pnpm = {
    ...packageJson.pnpm,
    overrides: {
      ...(packageJson.pnpm?.overrides ?? {}),
      ...overrides
    }
  };

  await writeFile(packageJsonPath, `${JSON.stringify(packageJson, null, 2)}\n`);
  await runCommand(
    pnpmExecutable,
    ['install', '--ignore-workspace', '--frozen-lockfile=false'],
    runtimeDirectory
  );
};

await rm(runtimeDirectory, { recursive: true, force: true });
await rm(tarballDirectory, { recursive: true, force: true });
await mkdir(artifactsDirectory, { recursive: true });
await mkdir(tarballDirectory, { recursive: true });
await cp(templateDirectory, runtimeDirectory, { recursive: true });

const tarballs = [];

for (const releasePackage of releasePackages) {
  tarballs.push(await packReleasePackage(releasePackage));
}

await installConsumerDependencies(tarballs);

console.log(`Prepared consumer runtime at ${runtimeDirectory}.`);
