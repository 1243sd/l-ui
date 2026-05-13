import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: './src/index.ts',
      name: 'LolitaComponentsVue',
      fileName: 'index'
    },
    rollupOptions: {
      external: ['vue', '@lolita-ui/theme']
    }
  }
});
