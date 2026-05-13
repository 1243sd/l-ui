import type { CuteIconComponent, CuteIconSet } from './types';

export type IconMap = Record<string, CuteIconComponent | undefined>;

export const createMapIconSet = (name: string, icons: IconMap): CuteIconSet => {
  return {
    name,
    resolve: (iconName: string) => icons[iconName]
  };
};

export const createLucideIconSet = (icons: IconMap, name = 'lucide'): CuteIconSet => {
  return createMapIconSet(name, icons);
};

export type IconifyResolver = (iconName: string) => CuteIconComponent | undefined;

export const createIconifyIconSet = (resolveIcon: IconifyResolver, name = 'iconify'): CuteIconSet => {
  return {
    name,
    resolve: (iconName: string) => resolveIcon(iconName)
  };
};
