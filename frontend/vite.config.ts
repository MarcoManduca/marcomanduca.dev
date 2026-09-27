/// <reference types="vitest/config" />
import { fileURLToPath } from 'node:url'

import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:8000',
    },
  },
  test: {
    environment: './src/test/jsdomUndiciEnvironment.ts',
    globals: true,
    setupFiles: ['src/test/setup.ts'],
    css: false,
    env: {
      VITE_API_BASE_URL: 'http://localhost/api/v1',
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['src/**'],
      exclude: [
        'src/main.tsx',
        'src/test/**',
        'src/types/**',
        'src/**/*.d.ts',
        'src/i18n/**',
      ],
      thresholds: {
        lines: 80,
      },
    },
  },
})
