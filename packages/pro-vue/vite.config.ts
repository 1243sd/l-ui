import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      entry: './src/index.ts',
      name: 'LolitaProVue',
      fileName: 'index'
    },
    rollupOptions: {
      external: ['vue', '@lolita-ui/components-vue', '@lolita-ui/utils', 'dayjs']
    }
  }
});
