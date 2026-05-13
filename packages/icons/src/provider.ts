import { inject } from 'vue';
import type { App, InjectionKey } from 'vue';
import type {
  CreateCuteIconProviderOptions,
  CuteIconPluginOptions,
  CuteIconProvider,
  CuteIconSet
} from './types';

export const cuteIconProviderKey: InjectionKey<CuteIconProvider> = Symbol('CuteIconProvider');

export const createCuteIconProvider = (options: CreateCuteIconProviderOptions = {}): CuteIconProvider => {
  const sets: CuteIconSet[] = [...(options.sets ?? [])];

  const provider: CuteIconProvider = {
    get setNames() {
      return sets.map((set) => set.name);
    },
    registerSet(iconSet) {
      const existingIndex = sets.findIndex((set) => set.name === iconSet.name);
      if (existingIndex >= 0) {
        sets.splice(existingIndex, 1);
      }
      sets.push(iconSet);
    },
    unregisterSet(setName) {
      const index = sets.findIndex((set) => set.name === setName);
      if (index >= 0) {
        sets.splice(index, 1);
      }
    },
    resolve(iconName) {
      for (let i = sets.length - 1; i >= 0; i -= 1) {
        const icon = sets[i].resolve(iconName);
        if (icon) {
          return icon;
        }
      }
      return undefined;
    }
  };

  return provider;
};

export const provideCuteIconProvider = (app: App, provider: CuteIconProvider): void => {
  app.provide(cuteIconProviderKey, provider);
};

export const createCuteIconPlugin = (options: CuteIconPluginOptions = {}) => {
  const provider = options.provider ?? createCuteIconProvider({ sets: options.sets });

  return {
    provider,
    install(app: App) {
      app.provide(cuteIconProviderKey, provider);
    }
  };
};

export const useCuteIconProvider = (): CuteIconProvider => {
  const provider = inject(cuteIconProviderKey, undefined);
  if (!provider) {
    throw new Error('[lolita-ui/icons] CuteIconProvider is not installed.');
  }
  return provider;
};
