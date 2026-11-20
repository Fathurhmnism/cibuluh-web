import { defineConfig } from 'vitest/config'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  resolve: { alias: { '@': fileURLToPath(new URL('.', import.meta.url)) } },
  test: {
    include: ['tests/**/*.test.ts'],
    environment: 'node',
    // Test integrasi memakai satu database bersama → jalankan berurutan
    fileParallelism: false,
    testTimeout: 20000,
  },
})
