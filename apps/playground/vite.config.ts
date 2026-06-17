import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

const toFsPath = (relativePath: string): string =>
  decodeURIComponent(new URL(relativePath, import.meta.url).pathname).replace(
    /^\/([A-Za-z]:)/,
    '$1'
  );

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: [
      {
        find: /^@lolita-ui\/components-vue\/style\.css$/,
        replacement: toFsPath('../../packages/components-vue/src/style.css')
      },
      {
        find: /^@lolita-ui\/components-vue$/,
        replacement: toFsPath('../../packages/components-vue/src/index.ts')
      },
      {
        find: /^@lolita-ui\/pro-vue\/style\.css$/,
        replacement: toFsPath('../../packages/pro-vue/src/style.css')
      },
      {
        find: /^@lolita-ui\/pro-vue$/,
        replacement: toFsPath('../../packages/pro-vue/src/index.ts')
      },
      {
        find: /^@lolita-ui\/theme$/,
        replacement: toFsPath('../../packages/theme/src/index.ts')
      }
    ]
  }
});
