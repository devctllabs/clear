import { describe, expect, it } from 'vitest'

import { formatCompactLocationPath, formatLocationPathLabel } from './location-path'

describe('location-path', () => {
  it('formats single-segment labels unchanged', () => {
    expect(formatCompactLocationPath(['Workspace'])).toBe('Workspace')
    expect(formatLocationPathLabel(['Workspace'])).toBe('Workspace')
  })

  it('formats two-segment labels in full', () => {
    expect(formatCompactLocationPath(['Reading Notes', 'History'])).toBe('Reading Notes / History')
    expect(formatLocationPathLabel(['Reading Notes', 'History'])).toBe('Reading Notes / History')
  })

  it('keeps the suffix path for deeper locations', () => {
    const path = [
      'Independent Study',
      'Reading Notes',
      'Clinical Neuroanatomy Differential Diagnosis and Case Review Archive',
    ]

    expect(formatCompactLocationPath(path)).toBe(
      '... / Reading Notes / Clinical Neuroanatomy Differential Diagnosis and Case Review Archive',
    )
    expect(formatLocationPathLabel(path)).toBe(
      'Independent Study / Reading Notes / Clinical Neuroanatomy Differential Diagnosis and Case Review Archive',
    )
  })

  it('filters blank segments and normalizes separator spacing', () => {
    expect(
      formatCompactLocationPath(['  Workspace  ', '', '  Reading Notes  ', '  History  ']),
    ).toBe(
      '... / Reading Notes / History',
    )
    expect(
      formatLocationPathLabel(['  Workspace  ', '', '  Reading Notes  ', '  History  ']),
    ).toBe(
      'Workspace / Reading Notes / History',
    )
  })

  it('keeps slashes inside segment names as content', () => {
    expect(formatCompactLocationPath(['Workspace', 'M&A / Legal', '2026 Review'])).toBe(
      '... / M&A / Legal / 2026 Review',
    )
    expect(formatLocationPathLabel(['Workspace', 'M&A / Legal', '2026 Review'])).toBe(
      'Workspace / M&A / Legal / 2026 Review',
    )
  })
})
