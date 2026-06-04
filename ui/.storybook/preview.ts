import type { Decorator, Preview } from '@storybook/react-vite'
import { createElement, useEffect, type ReactNode } from 'react'
import { useDarkMode } from 'storybook-dark-mode'

import '@assets/styles/globals.css'
import { AppI18nProvider } from '@core/i18n'
import { applyTheme } from '@core/theme'
import { useFocusModalityTracking } from '@shared/hooks/useFocusModalityTracking'
import {
  storybookRuntimeGlobalTypes,
  withStorybookRuntimeProfile,
} from '@/test/storybook/runtime-profile'

const StorybookThemeProvider = ({ children }: { children: ReactNode }) => {
  const isDarkMode = useDarkMode()

  useFocusModalityTracking()

  useEffect(() => {
    applyTheme(isDarkMode ? 'dark' : 'light')
  }, [isDarkMode])

  return children
}

const withStorybookTheme: Decorator = (Story) =>
  createElement(StorybookThemeProvider, null, Story())

const withStorybookI18n: Decorator = (Story) =>
  createElement(AppI18nProvider, null, Story())

const preview: Preview = {
  decorators: [withStorybookRuntimeProfile, withStorybookI18n, withStorybookTheme],
  globalTypes: storybookRuntimeGlobalTypes,
  parameters: {
    darkMode: {
      current: 'light',
    },

    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'error',
    },

    options: {
      storySort: {
        method: 'configure',
        order: ['*', ['*', ['Pages', 'Components']]],
      },
    },
  },
  tags: ['autodocs'],
}

export default preview
