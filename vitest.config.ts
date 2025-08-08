import { defineConfig } from 'vitest/config'
import path from 'node:path'

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    globals: true,
    css: true,
    include: [
      'components/**/*.test.{ts,tsx}',
      'app/**/*.test.{ts,tsx}',
      'lib/**/*.test.{ts,tsx}',
      'hooks/**/*.test.{ts,tsx}',
    ],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
})

