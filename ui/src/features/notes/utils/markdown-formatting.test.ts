import { describe, expect, it } from 'vitest'

import { applyMarkdownFormat } from './markdown-formatting'

describe('applyMarkdownFormat', () => {
  it('wraps selected text in bold markdown', () => {
    expect(
      applyMarkdownFormat({
        action: 'bold',
        selectionEnd: 18,
        selectionStart: 6,
        value: 'Study memory today',
      }),
    ).toEqual({
      selectionEnd: 20,
      selectionStart: 8,
      value: 'Study **memory today**',
    })
  })

  it('inserts and selects an italic placeholder without selected text', () => {
    expect(
      applyMarkdownFormat({
        action: 'italic',
        selectionEnd: 6,
        selectionStart: 6,
        value: 'Study ',
      }),
    ).toEqual({
      selectionEnd: 18,
      selectionStart: 7,
      value: 'Study *italic text*',
    })
  })

  it('inserts a markdown link and selects the URL for selected text', () => {
    expect(
      applyMarkdownFormat({
        action: 'link',
        selectionEnd: 9,
        selectionStart: 5,
        value: 'Read docs',
      }),
    ).toEqual({
      selectionEnd: 20,
      selectionStart: 12,
      value: 'Read [docs](https://)',
    })
  })

  it('adds unordered list markers to selected lines without duplicating existing markers', () => {
    expect(
      applyMarkdownFormat({
        action: 'list',
        selectionEnd: 17,
        selectionStart: 0,
        value: 'first\n- second\nthird',
      }),
    ).toEqual({
      selectionEnd: 24,
      selectionStart: 0,
      value: '- first\n- second\n- third',
    })
  })

  it('removes unordered list markers when all selected lines already have them', () => {
    expect(
      applyMarkdownFormat({
        action: 'list',
        selectionEnd: 16,
        selectionStart: 0,
        value: '- first\n- second',
      }),
    ).toEqual({
      selectionEnd: 12,
      selectionStart: 0,
      value: 'first\nsecond',
    })
  })

  it('uses the next available cloze id', () => {
    const value = 'The {{c1::hippocampus}} supports memory.'
    const selectionStart = value.indexOf('memory')

    expect(
      applyMarkdownFormat({
        action: 'cloze',
        selectionEnd: selectionStart + 'memory'.length,
        selectionStart,
        value,
      }),
    ).toEqual({
      selectionEnd: 45,
      selectionStart: 39,
      value: 'The {{c1::hippocampus}} supports {{c2::memory}}.',
    })
  })
})
