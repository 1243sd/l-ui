import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const workspaceRoot = path.resolve(currentDirectory, '..', '..', '..');

const readWorkspaceFile = (relativePath: string): string =>
  readFileSync(path.join(workspaceRoot, relativePath), 'utf8');

describe('truth sources stay aligned with implemented M7 capabilities', () => {
  it('documents table sorting and row selection in the component docs', () => {
    const tableDoc = readWorkspaceFile('docs/components/table.md');
    expect(tableDoc).toContain('rowSelection');
    expect(tableDoc).toContain('sortState');
    expect(tableDoc).not.toContain('当前未覆盖');
  });

  it('documents M7 ProSearchTable capabilities in the Pro docs', () => {
    const proDoc = readWorkspaceFile('docs/pro/pro-search-table.md');
    expect(proDoc).toContain('dateRange');
    expect(proDoc).toContain('sortState');
    expect(proDoc).toContain('bulkActions');
    expect(proDoc).toContain('rowSelection');
  });

  it('tracks M7 in the parity manifest and docs index', () => {
    const parityManifest = readWorkspaceFile('docs/implementation/parity-manifest.json');
    const docsIndex = readWorkspaceFile('docs/index.md');

    expect(parityManifest).toContain('dateRange');
    expect(parityManifest).toContain('rowSelection');
    expect(docsIndex).toContain('M7');
    expect(docsIndex).not.toContain(
      'Next executable stage plan: `docs/implementation/stage-plans/M7-advanced-pro-data-workflows.md`.'
    );
  });

  it('keeps the next Pro roadmap scenario-first across roadmap and parity truth sources', () => {
    const roadmap = readWorkspaceFile('docs/pro/business-components-roadmap.md');
    const parityManifest = readWorkspaceFile('docs/implementation/parity-manifest.json');

    expect(roadmap).toContain('List Pack');
    expect(roadmap).toContain('Detail Pack');
    expect(roadmap).toContain('Edit Pack');
    expect(roadmap).toContain('ValueEnum');

    expect(parityManifest).toContain('List Pack');
    expect(parityManifest).toContain('completedPacks');
    expect(parityManifest).toContain('Detail Pack');
    expect(parityManifest).toContain('Edit Pack');
    expect(parityManifest).not.toContain(
      '"goal": "Turn the common CRUD list page into a reusable default pattern built on top of ProSearchTable."'
    );
  });
});
