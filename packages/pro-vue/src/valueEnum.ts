import type { TagColor } from '@lolita-ui/components-vue';

export type ValueEnumTone = TagColor;
export type ValueEnumValue = string | number | boolean | null | undefined;
export type ValueEnumIcon = 'check' | 'clock' | 'close' | 'minus' | 'pause';

export type ValueEnumEntry =
  | string
  | {
      text: string;
      color?: ValueEnumTone;
      tone?: ValueEnumTone;
      icon?: ValueEnumIcon;
    };

export type ValueEnum = Record<string, ValueEnumEntry>;

export type ResolvedValueEnumEntry = {
  text: string;
  color: ValueEnumTone;
  tone: ValueEnumTone;
  icon?: ValueEnumIcon;
};

const DEFAULT_ENTRY_COLOR: ValueEnumTone = 'default';

export type ValueEnumItem = {
  text: string;
  color?: ValueEnumTone;
  tone?: ValueEnumTone;
  icon?: ValueEnumIcon;
};

export const defineValueEnum = <const T extends ValueEnum>(valueEnum: T): T => valueEnum;

export const normalizeValueEnumValue = (value: ValueEnumValue): string | undefined => {
  if (value === undefined || value === null) {
    return undefined;
  }

  return String(value);
};

export const getValueEnumItem = (
  valueEnum: ValueEnum | undefined,
  value: ValueEnumValue
): ValueEnumItem | undefined => {
  if (!valueEnum) {
    return undefined;
  }

  const normalizedValue = normalizeValueEnumValue(value);
  if (normalizedValue === undefined) {
    return undefined;
  }

  const entry = valueEnum[normalizedValue];
  if (entry === undefined) {
    return undefined;
  }

  if (typeof entry === 'string') {
    return {
      text: entry
    };
  }

  return {
    text: entry.text,
    color: entry.color,
    tone: entry.tone,
    icon: entry.icon
  };
};

export const resolveValueEnumEntry = (
  value: ValueEnumValue,
  valueEnum?: ValueEnum
): ResolvedValueEnumEntry | null => {
  const entry = getValueEnumItem(valueEnum, value);
  if (!entry) {
    return null;
  }

  const mergedColor = entry.tone ?? entry.color ?? DEFAULT_ENTRY_COLOR;

  return {
    text: entry.text,
    color: mergedColor,
    tone: mergedColor,
    icon: entry.icon
  };
};

export const resolveValueEnumText = (
  value: ValueEnumValue,
  valueEnum?: ValueEnum,
  fallback = '--'
): string => {
  const resolvedEntry = resolveValueEnumEntry(value, valueEnum);
  if (resolvedEntry) {
    return resolvedEntry.text;
  }

  if (value === undefined || value === null || value === '') {
    return fallback;
  }

  return String(value);
};

export const commonStatusValueEnum = defineValueEnum({
  active: {
    text: 'Active',
    tone: 'success',
    icon: 'check'
  },
  approved: {
    text: 'Approved',
    tone: 'success',
    icon: 'check'
  },
  archived: {
    text: 'Archived',
    tone: 'default',
    icon: 'pause'
  },
  disabled: {
    text: 'Disabled',
    tone: 'default',
    icon: 'minus'
  },
  enabled: {
    text: 'Enabled',
    tone: 'success',
    icon: 'check'
  },
  error: {
    text: 'Error',
    tone: 'danger',
    icon: 'close'
  },
  failed: {
    text: 'Failed',
    tone: 'danger',
    icon: 'close'
  },
  false: {
    text: 'Disabled',
    tone: 'default',
    icon: 'minus'
  },
  inactive: {
    text: 'Inactive',
    tone: 'default',
    icon: 'minus'
  },
  pending: {
    text: 'Pending',
    tone: 'warning',
    icon: 'clock'
  },
  processing: {
    text: 'Processing',
    tone: 'primary',
    icon: 'clock'
  },
  rejected: {
    text: 'Rejected',
    tone: 'danger',
    icon: 'close'
  },
  success: {
    text: 'Success',
    tone: 'success',
    icon: 'check'
  },
  true: {
    text: 'Enabled',
    tone: 'success',
    icon: 'check'
  },
  0: {
    text: 'Disabled',
    tone: 'default',
    icon: 'minus'
  },
  1: {
    text: 'Enabled',
    tone: 'success',
    icon: 'check'
  }
});
