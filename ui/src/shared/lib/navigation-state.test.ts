import { describe, expect, it } from 'vitest'

import {
  consumeReviewReturnTarget,
  readReviewReturnTarget,
  saveReviewReturnTarget,
} from './navigation-state'

describe('review navigation return target', () => {
  it('saves and consumes an internal return target once', () => {
    saveReviewReturnTarget('workspace-a', 'deck-a', '/dashboard/workspace-a/folders/folder-a')

    expect(readReviewReturnTarget('workspace-a', 'deck-a')).toBe(
      '/dashboard/workspace-a/folders/folder-a',
    )
    expect(consumeReviewReturnTarget('workspace-a', 'deck-a')).toBe(
      '/dashboard/workspace-a/folders/folder-a',
    )
    expect(consumeReviewReturnTarget('workspace-a', 'deck-a')).toBeUndefined()
  })

  it('keeps targets scoped by workspace and deck', () => {
    saveReviewReturnTarget('workspace-a', 'deck-a', '/dashboard/workspace-a')
    saveReviewReturnTarget('workspace-a', 'deck-b', '/dashboard/workspace-a/folders/folder-b')

    expect(consumeReviewReturnTarget('workspace-a', 'deck-b')).toBe(
      '/dashboard/workspace-a/folders/folder-b',
    )
    expect(consumeReviewReturnTarget('workspace-a', 'deck-a')).toBe(
      '/dashboard/workspace-a',
    )
  })

  it('ignores external or malformed targets', () => {
    saveReviewReturnTarget('workspace-a', 'deck-a', 'https://example.com/dashboard')
    saveReviewReturnTarget('workspace-a', 'deck-b', '//example.com/dashboard')
    window.sessionStorage.setItem(
      'clear:review-return-target:workspace-a:deck-c',
      '{"to":"/dashboard/workspace-a"}',
    )

    expect(consumeReviewReturnTarget('workspace-a', 'deck-a')).toBeUndefined()
    expect(consumeReviewReturnTarget('workspace-a', 'deck-b')).toBeUndefined()
    expect(consumeReviewReturnTarget('workspace-a', 'deck-c')).toBeUndefined()
  })
})
