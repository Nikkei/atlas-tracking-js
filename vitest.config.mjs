import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'happy-dom',
    globals: true,
    include: ['test/**/*.test.js'],
    exclude: ['test/build/**', 'node_modules/**'],
    setupFiles: [],
  },
});
