import type { ProActionIcon } from './types';

type ProIconAction = {
  key: string;
  icon?: ProActionIcon;
};

const PRO_ICON_MARKUP: Readonly<Record<ProActionIcon, string>> = {
  archive:
    '<svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><rect x="4" y="4" width="12" height="3.5" rx="1.5"/><path d="M5.5 8.5h9v6.75A1.75 1.75 0 0 1 12.75 17h-5.5A1.75 1.75 0 0 1 5.5 15.25V8.5Z"/><path d="M8 11h4"/></svg>',
  close:
    '<svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M6 6l8 8"/><path d="M14 6l-8 8"/></svg>',
  eye:
    '<svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M2.5 10s2.6-4.25 7.5-4.25S17.5 10 17.5 10s-2.6 4.25-7.5 4.25S2.5 10 2.5 10Z"/><circle cx="10" cy="10" r="2.15"/></svg>',
  filter:
    '<svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M3.5 5.5h13"/><path d="M6.5 10h7"/><path d="M8.5 14.5h3"/></svg>',
  plus:
    '<svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M10 4.5v11"/><path d="M4.5 10h11"/></svg>',
  refresh:
    '<svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M16 9.75A6 6 0 1 1 9.7 4"/><path d="M12.75 4H16v3.25"/></svg>',
  reset:
    '<svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M4 6.25V3.75h2.5"/><path d="M4.2 4.2A7 7 0 1 1 3 10"/></svg>',
  search:
    '<svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><circle cx="8.75" cy="8.75" r="4.75"/><path d="M12.5 12.5 16 16"/></svg>',
  sparkles:
    '<svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="m10 3 1.2 3.4L14.6 7.6l-3.4 1.2L10 12.2 8.8 8.8 5.4 7.6l3.4-1.2L10 3Z"/><path d="m15.1 12.7.6 1.6 1.6.6-1.6.6-.6 1.6-.6-1.6-1.6-.6 1.6-.6.6-1.6Z"/><path d="m4.8 11.6.45 1.15 1.15.45-1.15.45-.45 1.15-.45-1.15-1.15-.45 1.15-.45.45-1.15Z"/></svg>'
};

const inferProActionIcon = (key: string): ProActionIcon | undefined => {
  const normalized = key.trim().toLowerCase();

  if (
    normalized.includes('create') ||
    normalized.includes('add') ||
    normalized.includes('new')
  ) {
    return 'plus';
  }

  if (
    normalized.includes('refresh') ||
    normalized.includes('reload') ||
    normalized.includes('retry') ||
    normalized.includes('requery')
  ) {
    return 'refresh';
  }

  if (normalized.includes('archive')) {
    return 'archive';
  }

  if (
    normalized.includes('inspect') ||
    normalized.includes('view') ||
    normalized.includes('detail') ||
    normalized.includes('preview')
  ) {
    return 'eye';
  }

  if (
    normalized.includes('clear') ||
    normalized.includes('close') ||
    normalized.includes('remove')
  ) {
    return 'close';
  }

  return undefined;
};

export const resolveProIconMarkup = (icon: ProActionIcon): string =>
  PRO_ICON_MARKUP[icon];

export const resolveProActionIcon = (
  action: ProIconAction
): ProActionIcon | undefined => action.icon ?? inferProActionIcon(action.key);

export const hasProActionIcon = (action: ProIconAction): boolean =>
  resolveProActionIcon(action) !== undefined;

export const resolveProActionIconMarkup = (action: ProIconAction): string => {
  const icon = resolveProActionIcon(action);
  return icon ? resolveProIconMarkup(icon) : '';
};
