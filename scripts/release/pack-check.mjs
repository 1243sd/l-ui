import { access, readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const workspaceRoot = process.cwd();

const packageChecks = [
  {
    name: '@lolita-ui/components-vue',
    manifestPath: 'packages/components-vue/package.json',
    requiresStyleExport: true
  },
  {
    name: '@lolita-ui/pro-vue',
    manifestPath: 'packages/pro-vue/package.json',
    requiresStyleExport: true
  },
  {
    name: '@lolita-ui/theme',
    manifestPath: 'packages/theme/package.json',
    requiresStyleExport: false
  },
  {
    name: '@lolita-ui/utils',
    manifestPath: 'packages/utils/package.json',
    requiresStyleExport: false
  },
  {
    name: '@lolita-ui/tokens',
    manifestPath: 'packages/tokens/package.json',
    requiresStyleExport: false
  },
  {
    name: '@lolita-ui/icons',
    manifestPath: 'packages/icons/package.json',
    requiresStyleExport: false
  }
];

const failures = [];
const forbiddenPublishArtifactPattern = /(?:^|[\\/])[^\\/]+\.(?:spec|test)\.(?:[cm]?[jt]s|d\.ts|d\.ts\.map|js\.map)$/;

const expect = (condition, message) => {
  if (!condition) {
    failures.push(message);
  }
};

const collectFiles = async (directoryPath) => {
  const entries = await readdir(directoryPath, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const entryPath = path.join(directoryPath, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectFiles(entryPath)));
      continue;
    }
    files.push(entryPath);
  }

  return files;
};

for (const packageCheck of packageChecks) {
  const manifest = JSON.parse(
    await readFile(path.join(workspaceRoot, packageCheck.manifestPath), 'utf8')
  );
  const packageLabel = `[${packageCheck.name}]`;
  const exportRoot = manifest.exports?.['.'];
  const files = Array.isArray(manifest.files) ? manifest.files : [];
  const packageDirectory = path.join(workspaceRoot, path.dirname(packageCheck.manifestPath));
  const distDirectory = path.join(packageDirectory, 'dist');

  expect(
    typeof manifest.types === 'string' && manifest.types.startsWith('dist/'),
    `${packageLabel} "types" must point to a dist declaration file.`
  );
  expect(
    exportRoot && typeof exportRoot.types === 'string' && exportRoot.types.startsWith('./dist/'),
    `${packageLabel} exports["."].types must point to a dist declaration file.`
  );
  expect(
    !files.includes('src') && !files.includes('src/style.css'),
    `${packageLabel} "files" must not publish raw src entries.`
  );
  expect(
    files.includes('dist'),
    `${packageLabel} "files" must include dist artifacts.`
  );

  if (packageCheck.requiresStyleExport) {
    expect(
      manifest.exports?.['./style.css'] === './dist/style.css',
      `${packageLabel} style export must point to ./dist/style.css.`
    );
    expect(
      Array.isArray(manifest.sideEffects) &&
        manifest.sideEffects.some((entry) => typeof entry === 'string' && entry.includes('.css')),
      `${packageLabel} must declare CSS sideEffects so style imports are preserved.`
    );
  }

  const declaredTypePath =
    typeof manifest.types === 'string' ? path.join(packageDirectory, manifest.types) : null;
  if (declaredTypePath) {
    try {
      await access(declaredTypePath);
    } catch {
      failures.push(`${packageLabel} declared types file is missing: ${manifest.types}`);
    }
  }

  if (packageCheck.requiresStyleExport && typeof manifest.exports?.['./style.css'] === 'string') {
    const stylePath = path.join(
      packageDirectory,
      manifest.exports['./style.css']
    );
    try {
      await access(stylePath);
    } catch {
      failures.push(
        `${packageLabel} declared style export is missing: ${manifest.exports['./style.css']}`
      );
    }
  }

  try {
    const distFiles = await collectFiles(distDirectory);
    const forbiddenArtifacts = distFiles
      .map((filePath) => path.relative(packageDirectory, filePath).replaceAll(path.sep, '/'))
      .filter((relativePath) => forbiddenPublishArtifactPattern.test(relativePath));

    expect(
      forbiddenArtifacts.length === 0,
      `${packageLabel} dist must not publish test artifacts: ${forbiddenArtifacts.join(', ')}`
    );
  } catch {
    failures.push(`${packageLabel} dist directory is missing: dist`);
  }
}

if (failures.length > 0) {
  console.error('M6 package contract check failed:\n');
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log('M6 package contract check passed.');
