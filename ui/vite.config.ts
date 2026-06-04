/// <reference types="vitest/config" />

import path from 'node:path'
import { fileURLToPath, URL } from 'node:url'

import { storybookTest } from '@storybook/addon-vitest/vitest-plugin'
import tailwindcss from '@tailwindcss/vite'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import react from '@vitejs/plugin-react'
import { playwright } from '@vitest/browser-playwright'
import { defineConfig } from 'vite'

const dirname =
  typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url))
const clearApiProxyTarget = process.env.VITE_CLEAR_API_PROXY_TARGET?.trim()

export default defineConfig(({ mode }) => ({
  plugins: [
    tanstackRouter({ autoCodeSplitting: mode !== 'test', target: 'react' }),
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@api-generated': fileURLToPath(new URL('./src/shared/services/api/generated', import.meta.url)),
      '@assets': fileURLToPath(new URL('./src/assets', import.meta.url)),
      '@core': fileURLToPath(new URL('./src/core', import.meta.url)),
      '@features': fileURLToPath(new URL('./src/features', import.meta.url)),
      '@platform': fileURLToPath(new URL('./src/platform', import.meta.url)),
      '@shared': fileURLToPath(new URL('./src/shared', import.meta.url)),
      src: fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    ...(clearApiProxyTarget
      ? {
          proxy: {
            '/api/v1': {
              changeOrigin: true,
              target: clearApiProxyTarget,
            },
          },
        }
      : {}),
  },
  preview: {
    host: '0.0.0.0',
    port: 4173,
  },
  test: {
    coverage: {
      exclude: [
        '**/*.d.ts',
        '**/*.test.{ts,tsx}',
        'src/routeTree.gen.ts',
        'src/test/**',
        'src/vite-env.d.ts',
      ],
      include: ['src/**/*.{ts,tsx}'],
      provider: 'v8',
      reporter: ['text-summary', 'html', 'json-summary'],
      reportsDirectory: './coverage',
    },
    projects: [
      {
        extends: true,
        test: {
          environment: 'jsdom',
          isolate: false,
          pool: 'threads',
          setupFiles: ['./src/test/setup.ts'],
        },
      },
      {
        extends: true,
        plugins: [
          storybookTest({
            configDir: path.join(dirname, '.storybook'),
          }),
        ],
        test: {
          name: 'storybook',
          pool: 'threads',
          browser: {
            enabled: true,
            isolate: false,
            headless: true,
            provider: playwright({}),
            instances: [{ browser: 'chromium' }],
          },
        },
      },
    ],
  },
}))
