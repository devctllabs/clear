import { describe, expect, it } from 'vitest'

import {
  isDefaultSettingsFsrsParams,
  isSettingsFsrsParams,
  settingsFsrsDefaultParams,
  settingsFsrsParamsLength,
} from './fsrs-params'

describe('settings FSRS params utils', () => {
  it('accepts the default parameter vector', () => {
    expect(settingsFsrsDefaultParams).toHaveLength(settingsFsrsParamsLength)
    expect(isSettingsFsrsParams([...settingsFsrsDefaultParams])).toBe(true)
    expect(isDefaultSettingsFsrsParams(settingsFsrsDefaultParams)).toBe(true)
  })

  it('rejects invalid parameter vectors', () => {
    expect(isSettingsFsrsParams(settingsFsrsDefaultParams.slice(1))).toBe(false)
    expect(isSettingsFsrsParams([...settingsFsrsDefaultParams, Number.NaN])).toBe(false)
    expect(isSettingsFsrsParams('not params')).toBe(false)
  })

  it('distinguishes custom vectors from defaults', () => {
    const customParams: number[] = [...settingsFsrsDefaultParams]

    customParams[0] = customParams[0] + 1

    expect(isSettingsFsrsParams(customParams)).toBe(true)
    expect(isDefaultSettingsFsrsParams(customParams)).toBe(false)
  })
})
