import { act, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { renderHookWithProviders } from '@/test/renderHook'

import {
  useResetSettings,
  useSettings,
  useWriteSettings,
} from './useSettings'

describe('settings hooks', () => {
  it('reads, writes, and resets settings', async () => {
    const { result } = renderHookWithProviders(() => ({
      read: useSettings(),
      reset: useResetSettings(),
      write: useWriteSettings(),
    }))

    await waitFor(() => expect(result.current.read.data?.language).toBe('en-US'))
    const currentSettings = result.current.read.data

    if (!currentSettings) {
      throw new Error('Expected settings')
    }

    await act(async () => {
      await result.current.write.mutateAsync({
        ...currentSettings,
        dailyNewLimit: 42,
        language: 'fr-FR',
      })
    })

    await waitFor(() => {
      expect(result.current.read.data?.dailyNewLimit).toBe(42)
      expect(result.current.read.data?.language).toBe('fr-FR')
    })

    await act(async () => {
      await result.current.reset.mutateAsync()
    })

    await waitFor(() => {
      expect(result.current.read.data?.dailyNewLimit).toBe(20)
      expect(result.current.read.data?.language).toBe('en-US')
    })
  })
})
