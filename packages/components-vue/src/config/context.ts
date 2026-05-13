import { computed, inject, type InjectionKey } from 'vue';

export type ComponentSize = 'small' | 'middle' | 'large';

export type LolitaConfig = {
  prefixCls: string;
  componentSize: ComponentSize;
};

const defaultConfig: LolitaConfig = {
  prefixCls: 'l',
  componentSize: 'middle'
};

export const lolitaConfigKey: InjectionKey<Readonly<{ value: LolitaConfig }>> = Symbol('lolita-config');

export const useLolitaConfig = (): Readonly<{ value: LolitaConfig }> => {
  return inject(lolitaConfigKey, computed(() => defaultConfig));
};
