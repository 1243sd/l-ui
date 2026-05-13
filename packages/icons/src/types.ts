import type { Component } from 'vue';

export interface CuteIconProps {
  size?: number | string;
  color?: string;
  strokeWidth?: number | string;
  class?: string;
}

export type CuteIconComponent = Component;

export interface CuteIconSet {
  name: string;
  resolve: (iconName: string) => CuteIconComponent | undefined;
}

export interface CuteIconProvider {
  readonly setNames: string[];
  registerSet: (iconSet: CuteIconSet) => void;
  unregisterSet: (setName: string) => void;
  resolve: (iconName: string) => CuteIconComponent | undefined;
}

export interface CreateCuteIconProviderOptions {
  sets?: CuteIconSet[];
}

export interface CuteIconPluginOptions {
  provider?: CuteIconProvider;
  sets?: CuteIconSet[];
}
