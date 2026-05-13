import path from 'node:path';
import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['packages/**/*.spec.ts']
  },
  resolve: {
    alias: {
      '@lolita-ui/tokens': path.resolve(__dirname, 'packages/tokens/src/index.ts'),
      '@lolita-ui/theme': path.resolve(__dirname, 'packages/theme/src/index.ts'),
      '@lolita-ui/components-vue': path.resolve(__dirname, 'packages/components-vue/src/index.ts'),
      '@lolita-ui/icons': path.resolve(__dirname, 'packages/icons/src/index.ts'),
      '@lolita-ui/utils': path.resolve(__dirname, 'packages/utils/src/index.ts'),
      '@lolita-ui/pro-vue': path.resolve(__dirname, 'packages/pro-vue/src/index.ts')
    }
  }
});
