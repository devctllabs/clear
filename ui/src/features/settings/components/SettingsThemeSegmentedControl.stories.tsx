import { useState, type ComponentProps } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'

import { formCanvas } from '@/test/storybook/decorators'

import { SettingsThemeSegmentedControl } from './SettingsThemeSegmentedControl'

const noop = () => undefined

const SettingsThemeSegmentedControlStory = ({
  theme: initialTheme,
}: ComponentProps<typeof SettingsThemeSegmentedControl>) => {
  const [theme, setTheme] = useState(initialTheme)

  return (
    <div className="flex items-center justify-between gap-4 rounded-card bg-card px-6 py-5 shadow-card">
      <p className="type-row-title text-foreground">
        Theme
      </p>
      <SettingsThemeSegmentedControl theme={theme} onThemeChange={setTheme} />
    </div>
  )
}

const meta = {
  args: {
    onThemeChange: noop,
    theme: 'light',
  },
  component: SettingsThemeSegmentedControl,
  decorators: [formCanvas],
  parameters: {
    layout: 'fullscreen',
  },
  render: (args) => <SettingsThemeSegmentedControlStory {...args} />,
  title: 'Features/Settings/Components/SettingsThemeSegmentedControl',
} satisfies Meta<typeof SettingsThemeSegmentedControl>

export default meta

type Story = StoryObj<typeof meta>

export const Light: Story = {}

export const Dark: Story = {
  args: {
    theme: 'dark',
  },
}

export const System: Story = {
  args: {
    theme: 'system',
  },
}
