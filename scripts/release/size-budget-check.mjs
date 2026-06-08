import { spawn } from 'node:child_process';
import { mkdir, readFile, readdir, rm, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const workspaceRoot = path.resolve(scriptDirectory, '..', '..');
const packagesDirectory = path.join(workspaceRoot, 'packages');
const baselinePath = path.join(workspaceRoot, 'docs', 'release', 'size-budgets.json');
const packOutputDirectory = path.join(workspaceRoot, '.artifacts', 'size-budget-tarballs');
const pnpmExecutable = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm';
const writeBaseline = process.argv.includes('--write-baseline');

const defaultThresholds = {
  jsPercent: 15,
  cssPercent: 15,
  tarballPercent: 20
};

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

const safeStat = async (filePath) => {
  try {
    return await stat(filePath);
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      return null;
    }
    throw error;
  }
};

const toTarballBaseName = (packageName) =>
  packageName.replace(/^@/, '').replace(/\//g, '-');

const percentageLimit = (baselineValue, thresholdPercent) =>
  Math.ceil(baselineValue * (1 + thresholdPercent / 100));

const formatDelta = (baselineValue, currentValue) => {
  if (baselineValue === 0) {
    return 'n/a';
  }

  const delta = ((currentValue - baselineValue) / baselineValue) * 100;
  return `${delta.toFixed(2)}%`;
};

const collectPackageMetrics = async (directoryEntry) => {
  const packageRoot = path.join(packagesDirectory, directoryEntry.name);
  const manifest = await readJson(path.join(packageRoot, 'package.json'));
  const distDirectory = path.join(packageRoot, 'dist');
  const jsStat = await safeStat(path.join(distDirectory, 'index.js'));
  const styleStat =
    (await safeStat(path.join(distDirectory, 'style.css'))) ??
    (await safeStat(path.join(distDirectory, 'index.css')));
  const tarballName = `${toTarballBaseName(manifest.name)}-${manifest.version}.tgz`;
  const tarballPath = path.join(packOutputDirectory, tarballName);

  await runCommand(pnpmExecutable, ['pack', '--pack-destination', packOutputDirectory], packageRoot);

  const tarballStat = await safeStat(tarballPath);

  if (!jsStat) {
    throw new Error(`[size:check] Missing built JS artifact for ${manifest.name}: dist/index.js`);
  }

  if (!tarballStat) {
    throw new Error(`[size:check] Missing packed tarball for ${manifest.name}: ${tarballName}`);
  }

  return {
    jsBytes: jsStat.size,
    cssBytes: styleStat?.size ?? null,
    tarballBytes: tarballStat.size
  };
};

await mkdir(path.dirname(baselinePath), { recursive: true });
await mkdir(path.dirname(packOutputDirectory), { recursive: true });
await rm(packOutputDirectory, { recursive: true, force: true });
await mkdir(packOutputDirectory, { recursive: true });

const packageEntries = (await readdir(packagesDirectory, { withFileTypes: true }))
  .filter((entry) => entry.isDirectory())
  .sort((left, right) => left.name.localeCompare(right.name));

const currentMetrics = {};

for (const packageEntry of packageEntries) {
  const manifest = await readJson(path.join(packagesDirectory, packageEntry.name, 'package.json'));
  currentMetrics[manifest.name] = await collectPackageMetrics(packageEntry);
}

const nextBaseline = {
  thresholds: defaultThresholds,
  packages: currentMetrics
};

if (writeBaseline) {
  await writeFile(baselinePath, `${JSON.stringify(nextBaseline, null, 2)}\n`);
  console.log(`Wrote size budget baseline to ${baselinePath}.`);
  process.exit(0);
}

const baseline = await readJson(baselinePath);
const thresholds = baseline.thresholds ?? defaultThresholds;
const failures = [];

for (const [packageName, metrics] of Object.entries(currentMetrics)) {
  const baselineMetrics = baseline.packages?.[packageName];

  if (!baselineMetrics) {
    failures.push(`- [${packageName}] missing size baseline entry`);
    continue;
  }

  const jsLimit = percentageLimit(baselineMetrics.jsBytes, thresholds.jsPercent);
  if (metrics.jsBytes > jsLimit) {
    failures.push(
      `- [${packageName}] JS artifact grew from ${baselineMetrics.jsBytes} to ${metrics.jsBytes} bytes (${formatDelta(
        baselineMetrics.jsBytes,
        metrics.jsBytes
      )}); limit is ${jsLimit} bytes`
    );
  }

  if (baselineMetrics.cssBytes === null && metrics.cssBytes !== null) {
    failures.push(`- [${packageName}] CSS artifact now exists but no baseline is recorded`);
  } else if (baselineMetrics.cssBytes !== null && metrics.cssBytes === null) {
    failures.push(`- [${packageName}] CSS artifact is missing but baseline expects one`);
  } else if (baselineMetrics.cssBytes !== null && metrics.cssBytes !== null) {
    const cssLimit = percentageLimit(baselineMetrics.cssBytes, thresholds.cssPercent);
    if (metrics.cssBytes > cssLimit) {
      failures.push(
        `- [${packageName}] CSS artifact grew from ${baselineMetrics.cssBytes} to ${metrics.cssBytes} bytes (${formatDelta(
          baselineMetrics.cssBytes,
          metrics.cssBytes
        )}); limit is ${cssLimit} bytes`
      );
    }
  }

  const tarballLimit = percentageLimit(
    baselineMetrics.tarballBytes,
    thresholds.tarballPercent
  );
  if (metrics.tarballBytes > tarballLimit) {
    failures.push(
      `- [${packageName}] tarball grew from ${baselineMetrics.tarballBytes} to ${metrics.tarballBytes} bytes (${formatDelta(
        baselineMetrics.tarballBytes,
        metrics.tarballBytes
      )}); limit is ${tarballLimit} bytes`
    );
  }
}

if (failures.length > 0) {
  console.error('M6 size budget check failed:\n');
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log('M6 size budget check passed.');
