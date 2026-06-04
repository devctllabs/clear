import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'

import { formCanvas } from '@/test/storybook/decorators'

import { settingsLanguageOptions } from '../constants/settings-options'
import { SettingsSection } from './SettingsSection'
import {
  SettingsDropdownRow,
  SettingsNumberRow,
  SettingsRow,
  SettingsSliderRow,
} from './SettingsRows'

const SettingsRowsStory = () => {
  const [language, setLanguage] = useState('en-US')
  const [dailyLimit, setDailyLimit] = useState(20)
  const [retention, setRetention] = useState(90)

  return (
    <SettingsSection title="Study Settings">
      <SettingsDropdownRow
        description="System preference"
        label="Language"
        options={settingsLanguageOptions}
        value={language}
        onSelect={setLanguage}
      />
      <SettingsRow
        chevron
        description="Search a city or IANA timezone"
        label="Timezone"
        value="Automatic"
        onClick={() => undefined}
      />
      <SettingsNumberRow
        description="Max new cards per day"
        label="New cards per day"
        value={dailyLimit}
        onChange={setDailyLimit}
      />
      <SettingsSliderRow
        description="Minimum probability of recall at the next scheduled review"
        label="Target recall probability"
        value={retention}
        onChange={setRetention}
      />
    </SettingsSection>
  )
}

const meta = {
  args: {
    description: 'System preference',
    label: 'Language',
    value: 'English',
  },
  component: SettingsRow,
  decorators: [formCanvas],
  parameters: {
    layout: 'fullscreen',
  },
  render: () => <SettingsRowsStory />,
  title: 'Features/Settings/Components/SettingsRows',
} satisfies Meta<typeof SettingsRow>

export default meta

type Story = StoryObj<typeof meta>

export const MixedRows: Story = {}
