import { act, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { createAppServices } from '@core/services'
import { ok } from '@shared/errors'
import { renderHookWithProviders } from '@/test/renderHook'

import { useContentSearch } from './useContentSearch'
import { useDebouncedValue } from './useDebouncedValue'

describe('content search hooks', () => {
  it('debounces value changes', () => {
    vi.useFakeTimers()

    const { result, rerender } = renderHookWithProviders(
      ({ value }) => useDebouncedValue(value, 200),
      { initialProps: { value: 'initial' } },
    )

    expect(result.current).toBe('initial')

    rerender({ value: 'updated' })
    expect(result.current).toBe('initial')

    act(() => {
      vi.advanceTimersByTime(199)
    })
    expect(result.current).toBe('initial')

    act(() => {
      vi.advanceTimersByTime(1)
    })
    expect(result.current).toBe('updated')
  })

  it('does not call the search service for blank queries', async () => {
    const services = createAppServices('mock')
    const search = vi.fn(async () => ok([]))
    services.contentSearch = { search }

    renderHookWithProviders(
      () => useContentSearch({ kind: 'workspace', workspaceId: 'independent-study' }, '   '),
      { services },
    )

    await waitFor(() => expect(search).not.toHaveBeenCalled())
  })

  it('trims query text and searches within the requested scope', async () => {
    const services = createAppServices('mock')
    const search = vi.fn(async () => ok([]))
    services.contentSearch = { search }

    renderHookWithProviders(
      () => useContentSearch({ kind: 'workspace', workspaceId: 'independent-study' }, ' neural '),
      { services },
    )

    await waitFor(() =>
      expect(search).toHaveBeenCalledWith(
        { kind: 'workspace', workspaceId: 'independent-study' },
        'neural',
      ),
    )
  })
})
