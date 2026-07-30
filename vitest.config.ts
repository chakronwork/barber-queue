import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

const srcDir = fileURLToPath(new URL('./src', import.meta.url));

export default defineConfig({
  resolve: {
    alias: [{ find: /^@\//, replacement: srcDir + '/' }],
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    setupFiles: ['./src/test/setup.ts'],
  },
});
