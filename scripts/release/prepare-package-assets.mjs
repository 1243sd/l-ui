import { copyFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import process from 'node:process';

const packageName = process.argv[2];

if (!packageName) {
  console.error('Usage: node scripts/release/prepare-package-assets.mjs <package-name>');
  process.exit(1);
}

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const workspaceRoot = path.resolve(scriptDirectory, '..', '..');

const assetPlans = {
  'components-vue': [
    {
      from: 'packages/components-vue/src/style.css',
      to: 'packages/components-vue/dist/style.css'
    }
  ],
  'pro-vue': [
    {
      from: 'packages/pro-vue/dist/index.css',
      to: 'packages/pro-vue/dist/style.css'
    }
  ]
};

const plans = assetPlans[packageName];

if (!plans) {
  console.error(`Unknown package asset plan: ${packageName}`);
  process.exit(1);
}

for (const plan of plans) {
  const sourcePath = path.join(workspaceRoot, plan.from);
  const targetPath = path.join(workspaceRoot, plan.to);

  await mkdir(path.dirname(targetPath), { recursive: true });
  await copyFile(sourcePath, targetPath);
}

console.log(`Prepared release assets for ${packageName}.`);
