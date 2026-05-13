import type { InjectionKey, Ref } from 'vue';
import type { LolitaTheme } from './createLolitaTheme';

export const lolitaThemeKey: InjectionKey<Ref<LolitaTheme>> = Symbol('lolitaTheme');
