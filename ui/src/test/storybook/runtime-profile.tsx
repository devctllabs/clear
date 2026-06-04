import type { Decorator, Preview } from '@storybook/react-vite'
import type { ReactNode } from 'react'

import { AppRuntimeProfileProvider } from '@shared/hooks/useAppLayoutMode'
import type { RuntimeFormFactor, RuntimeProfile } from '@shared/lib/runtime-profile'

const storybookFormFactors = ['desktop', 'mobile'] as const

type StorybookFormFactor = (typeof storybookFormFactors)[number]

const isStorybookFormFactor = (value: unknown): value is StorybookFormFactor =>
  storybookFormFactors.includes(value as StorybookFormFactor)

const normalizeStorybookFormFactor = (value: unknown): RuntimeFormFactor =>
  isStorybookFormFactor(value) ? value : 'desktop'

const createStorybookRuntimeProfile = (
  formFactor: RuntimeFormFactor,
): RuntimeProfile => ({
  formFactor,
  runtime: 'web',
})

const StorybookRuntimeProfileProvider = ({
  children,
  formFactor,
}: {
  children: ReactNode
  formFactor: RuntimeFormFactor
}) => (
  <AppRuntimeProfileProvider
    key={formFactor}
    initialProfile={createStorybookRuntimeProfile(formFactor)}
  >
    {children}
  </AppRuntimeProfileProvider>
)

export const storybookRuntimeGlobalTypes = {
  appFormFactor: {
    defaultValue: 'desktop',
    description: 'Switch the Clear app layout form factor.',
    name: 'Form Factor',
    toolbar: {
      dynamicTitle: true,
      icon: 'mobile',
      items: [
        { title: 'Desktop', value: 'desktop' },
        { title: 'App', value: 'mobile' },
      ],
    },
  },
} satisfies NonNullable<Preview['globalTypes']>

export const withStorybookRuntimeProfile: Decorator = (Story, context) => {
  const formFactor = normalizeStorybookFormFactor(context.globals.appFormFactor)

  return (
    <StorybookRuntimeProfileProvider formFactor={formFactor}>
      <Story />
    </StorybookRuntimeProfileProvider>
  )
}
