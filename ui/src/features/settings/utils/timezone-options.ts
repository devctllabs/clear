export type SettingsTimezoneOption = Readonly<{
  description: string
  label: string
  value: string
}>

const automaticTimezoneOption: SettingsTimezoneOption = {
  description: 'Use system timezone',
  label: 'Automatic',
  value: 'auto',
}

const fallbackTimezoneValues = ['Etc/UTC']

export const formatTimezoneDisplayName = (timeZone: string) => {
  if (timeZone === 'auto') {
    return 'Automatic'
  }

  const parts = timeZone.split('/')
  const leaf = parts[parts.length - 1] ?? timeZone

  return leaf.replace(/_/g, ' ')
}

const getTimezoneOptions = (): SettingsTimezoneOption[] => {
  const supported = (
    typeof Intl !== 'undefined' && typeof Intl.supportedValuesOf === 'function'
      ? Intl.supportedValuesOf('timeZone')
      : null
  ) as string[] | null

  const values = supported?.length ? supported : fallbackTimezoneValues
  const unique = Array.from(new Set(values))

  return [
    automaticTimezoneOption,
    ...unique
      .filter((timeZone) => timeZone !== 'auto')
      .map((timeZone) => ({
        description: timeZone,
        label: formatTimezoneDisplayName(timeZone),
        value: timeZone,
      }))
      .sort((left, right) => left.label.localeCompare(right.label)),
  ]
}

export const settingsTimezoneOptions = getTimezoneOptions()

export const settingsTimezoneLabelMap = new Map(
  settingsTimezoneOptions.map((option) => [option.value, option.label]),
)
