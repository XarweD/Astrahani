import { defineConfig } from 'vite';

export default defineConfig({
  root: 'public',

  // Пусть Vite копирует статику в dist как есть
  // Создай папку public/static и положи туда partials и assets/js/blocks
  publicDir: 'static',

  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  },

  build: {
    outDir: '../dist',
    emptyOutDir: true
  }
});
