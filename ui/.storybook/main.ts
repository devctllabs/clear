import type { StorybookConfig } from '@storybook/react-vite'

const storybookOptimizeDeps = ['storybook-dark-mode', 'zustand', 'zustand/middleware']

const config: StorybookConfig = {
  addons: [
    '@storybook/addon-docs',
    '@storybook/addon-vitest',
    '@storybook/addon-a11y',
    'storybook-dark-mode',
  ],
  core: {
    builder: '@storybook/builder-vite',
  },
  framework: '@storybook/react-vite',
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  viteFinal: (config) => ({
    ...config,
    optimizeDeps: {
      ...config.optimizeDeps,
      include: Array.from(
        new Set([...(config.optimizeDeps?.include ?? []), ...storybookOptimizeDeps]),
      ),
    },
  }),
}

export default config
