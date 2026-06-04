import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  formatTimezoneDisplayName,
  settingsTimezoneLabelMap,
  settingsTimezoneOptions,
} from './timezone-options'

describe('settings timezone options utils', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.resetModules()
  })

  it('formats timezone labels for settings rows', () => {
    expect(formatTimezoneDisplayName('auto')).toBe('Automatic')
    expect(formatTimezoneDisplayName('America/Los_Angeles')).toBe('Los Angeles')
    expect(formatTimezoneDisplayName('America/Argentina/Buenos_Aires')).toBe(
      'Buenos Aires',
    )
  })

  it('keeps automatic timezone available as the first option', () => {
    expect(settingsTimezoneOptions[0]).toMatchObject({
      label: 'Automatic',
      value: 'auto',
    })
    expect(settingsTimezoneLabelMap.get('auto')).toBe('Automatic')
  })

  it('uses plain IANA timezone descriptions', async () => {
    vi.stubGlobal('Intl', {
      supportedValuesOf: () => ['America/Los_Angeles'],
    })
    vi.resetModules()

    const timezoneUtils = await import('./timezone-options')
    const option = timezoneUtils.settingsTimezoneOptions.find(
      (timezoneOption) => timezoneOption.value === 'America/Los_Angeles',
    )

    expect(option).toMatchObject({
      description: 'America/Los_Angeles',
      label: 'Los Angeles',
      value: 'America/Los_Angeles',
    })
  })

  it('falls back to automatic and UTC when supported timezones are unavailable', async () => {
    vi.stubGlobal('Intl', { supportedValuesOf: undefined })
    vi.resetModules()

    const timezoneUtils = await import('./timezone-options')

    expect(timezoneUtils.settingsTimezoneOptions).toEqual([
      {
        description: 'Use system timezone',
        label: 'Automatic',
        value: 'auto',
      },
      {
        description: 'Etc/UTC',
        label: 'UTC',
        value: 'Etc/UTC',
      },
    ])
  })

  it('deduplicates timezone values', () => {
    const values = settingsTimezoneOptions.map((option) => option.value)

    expect(new Set(values).size).toBe(values.length)
  })
})
