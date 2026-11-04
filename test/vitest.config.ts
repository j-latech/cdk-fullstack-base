import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    // You can add more config here if needed
  },
  coverage: {
    provider: 'v8',
    reporter: ['text', 'json', 'lcov'], 
    exclude: ['**/*.d.ts', '**/node_modules/**'],
  },
} as any);