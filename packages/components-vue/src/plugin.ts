import type { App, Plugin } from 'vue';
import { LButton } from './components/Button';
import { LConfigProvider } from './components/ConfigProvider';
import { LSpace } from './components/Space';
import { LThemeProvider } from './components/ThemeProvider';

const components = [LConfigProvider, LThemeProvider, LButton, LSpace] as const;

export const install = (app: App): void => {
  components.forEach((component) => {
    app.component(component.name ?? '', component);
  });
};

const LolitaUI: Plugin = { install };

export default LolitaUI;
