import { spawn } from 'node:child_process';
import { cp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const workspaceRoot = path.resolve(scriptDirectory, '..', '..');
const templateDirectory = path.join(workspaceRoot, 'apps', 'consumer-smoke');
const artifactsDirectory = path.join(workspaceRoot, '.artifacts');
const runtimeDirectoryPrefix = 'consumer-smoke-runtime-';
const runtimeStatePath = path.join(artifactsDirectory, 'consumer-runtime.json');
const tarballDirectory = path.join(artifactsDirectory, 'consumer-tarballs');
const pnpmExecutable = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm';
const powershellExecutable = process.platform === 'win32' ? 'powershell.exe' : null;

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

const sleep = (delayMs) =>
  new Promise((resolve) => {
    setTimeout(resolve, delayMs);
  });

const listWindowsProcesses = async (name) => {
  if (!powershellExecutable) {
    return [];
  }

  return new Promise((resolve, reject) => {
    const script = [
      `$items = Get-CimInstance Win32_Process -Filter "name = '${name}'" -ErrorAction SilentlyContinue | Select-Object ProcessId,ExecutablePath,CommandLine`,
      "if ($null -eq $items) { '[]' } else { @($items) | ConvertTo-Json -Compress }"
    ].join('; ');
    let stdout = '';
    let stderr = '';
    const child = spawn(powershellExecutable, ['-NoProfile', '-Command', script], {
      cwd: workspaceRoot,
      stdio: ['ignore', 'pipe', 'pipe']
    });

    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
    });
    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });

    child.on('exit', (code) => {
      if (code !== 0) {
        reject(new Error(stderr.trim() || `Failed to inspect ${name} processes.`));
        return;
      }

      const output = stdout.trim();
      if (!output) {
        resolve([]);
        return;
      }

      const parsed = JSON.parse(output);
      resolve(Array.isArray(parsed) ? parsed : [parsed]);
    });

    child.on('error', reject);
  });
};

const killRuntimeProcesses = async () => {
  if (!powershellExecutable) {
    return;
  }

  const processGroups = await Promise.all([
    listWindowsProcesses('esbuild.exe'),
    listWindowsProcesses('node.exe')
  ]);

  const runtimeProcesses = processGroups
    .flat()
    .filter((processInfo) => {
      const executablePath = String(processInfo.ExecutablePath ?? '').toLowerCase();
      const commandLine = String(processInfo.CommandLine ?? '').toLowerCase();
      return (
        executablePath.includes(runtimeDirectoryPrefix) ||
        commandLine.includes(runtimeDirectoryPrefix)
      );
    });

  for (const processInfo of runtimeProcesses) {
    console.log(
      `Stopping stale consumer runtime process ${processInfo.ProcessId}: ${processInfo.ExecutablePath ?? processInfo.CommandLine ?? 'unknown'}`
    );
    await runCommand('taskkill', ['/F', '/PID', String(processInfo.ProcessId)], workspaceRoot);
  }
};

const cleanDirectory = async (directory) => {
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      await rm(directory, { recursive: true, force: true });
      return;
    } catch (error) {
      if (process.platform !== 'win32' || attempt === 3) {
        throw error;
      }

      await killRuntimeProcesses();
      await sleep(250 * attempt);
    }
  }
};

const createRuntimeDirectory = () =>
  path.join(artifactsDirectory, `${runtimeDirectoryPrefix}${Date.now()}`);

const prunePreviousRuntimeDirectories = async (activeRuntimeDirectory) => {
  const artifactEntries = await readdir(artifactsDirectory, { withFileTypes: true });

  for (const entry of artifactEntries) {
    if (!entry.isDirectory() || !entry.name.startsWith(runtimeDirectoryPrefix)) {
      continue;
    }

    const candidateDirectory = path.join(artifactsDirectory, entry.name);
    if (candidateDirectory === activeRuntimeDirectory) {
      continue;
    }

    try {
      await cleanDirectory(candidateDirectory);
    } catch (error) {
      console.warn(`Skipping stale consumer runtime cleanup for ${candidateDirectory}: ${error}`);
    }
  }
};

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

const installConsumerDependencies = async (runtimeDirectory, tarballs) => {
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

await killRuntimeProcesses();
await cleanDirectory(tarballDirectory);
await mkdir(artifactsDirectory, { recursive: true });
await mkdir(tarballDirectory, { recursive: true });
const runtimeDirectory = createRuntimeDirectory();
await cleanDirectory(runtimeDirectory);
await cp(templateDirectory, runtimeDirectory, { recursive: true });

const tarballs = [];

for (const releasePackage of releasePackages) {
  tarballs.push(await packReleasePackage(releasePackage));
}

await installConsumerDependencies(runtimeDirectory, tarballs);
await writeFile(
  runtimeStatePath,
  `${JSON.stringify({ runtimeDirectory }, null, 2)}\n`
);
await prunePreviousRuntimeDirectories(runtimeDirectory);

console.log(`Prepared consumer runtime at ${runtimeDirectory}.`);
