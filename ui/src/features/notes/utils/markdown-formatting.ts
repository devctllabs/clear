export type MarkdownFormatAction = 'bold' | 'cloze' | 'italic' | 'link' | 'list'

export type MarkdownFormatInput = {
  action: MarkdownFormatAction
  selectionEnd: number
  selectionStart: number
  value: string
}

export type MarkdownFormatResult = {
  selectionEnd: number
  selectionStart: number
  value: string
}

type NormalizedSelection = {
  end: number
  start: number
}

export const applyMarkdownFormat = ({
  action,
  selectionEnd,
  selectionStart,
  value,
}: MarkdownFormatInput): MarkdownFormatResult => {
  const selection = normalizeSelection(value, selectionStart, selectionEnd)

  if (action === 'bold') {
    return wrapSelection(value, selection, '**', '**', 'bold text')
  }

  if (action === 'italic') {
    return wrapSelection(value, selection, '*', '*', 'italic text')
  }

  if (action === 'link') {
    return insertLink(value, selection)
  }

  if (action === 'list') {
    return toggleUnorderedList(value, selection)
  }

  return wrapSelection(
    value,
    selection,
    `{{${getNextClozeId(value)}::`,
    '}}',
    'cloze text',
  )
}

const normalizeSelection = (
  value: string,
  selectionStart: number,
  selectionEnd: number,
): NormalizedSelection => {
  const start = Math.min(selectionStart, selectionEnd)
  const end = Math.max(selectionStart, selectionEnd)

  return {
    end: clamp(end, 0, value.length),
    start: clamp(start, 0, value.length),
  }
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max)

const wrapSelection = (
  value: string,
  selection: NormalizedSelection,
  prefix: string,
  suffix: string,
  placeholder: string,
): MarkdownFormatResult => {
  const selectedText = value.slice(selection.start, selection.end)
  const content = selectedText.length > 0 ? selectedText : placeholder
  const nextValue = replaceRange(
    value,
    selection.start,
    selection.end,
    `${prefix}${content}${suffix}`,
  )
  const contentStart = selection.start + prefix.length

  return {
    selectionEnd: contentStart + content.length,
    selectionStart: contentStart,
    value: nextValue,
  }
}

const insertLink = (
  value: string,
  selection: NormalizedSelection,
): MarkdownFormatResult => {
  const selectedText = value.slice(selection.start, selection.end)
  const text = selectedText.length > 0 ? selectedText : 'link text'
  const url = 'https://'
  const markdown = `[${text}](${url})`
  const nextValue = replaceRange(value, selection.start, selection.end, markdown)

  if (selectedText.length === 0) {
    return {
      selectionEnd: selection.start + 1 + text.length,
      selectionStart: selection.start + 1,
      value: nextValue,
    }
  }

  const urlStart = selection.start + `[${text}](`.length

  return {
    selectionEnd: urlStart + url.length,
    selectionStart: urlStart,
    value: nextValue,
  }
}

const toggleUnorderedList = (
  value: string,
  selection: NormalizedSelection,
): MarkdownFormatResult => {
  const lineStart = value.lastIndexOf('\n', selection.start - 1) + 1
  const effectiveEnd =
    selection.end > selection.start && value[selection.end - 1] === '\n'
      ? selection.end - 1
      : selection.end
  const nextLineBreak = value.indexOf('\n', effectiveEnd)
  const lineEnd = nextLineBreak === -1 ? value.length : nextLineBreak
  const block = value.slice(lineStart, lineEnd)
  const lines = block.split('\n')
  const nonEmptyLines = lines.filter((line) => line.trim().length > 0)
  const removePrefixes =
    nonEmptyLines.length > 0 && nonEmptyLines.every((line) => line.startsWith('- '))
  const nextBlock = lines
    .map((line) => {
      if (line.trim().length === 0) {
        return line
      }

      if (removePrefixes) {
        return line.startsWith('- ') ? line.slice(2) : line
      }

      return line.startsWith('- ') ? line : `- ${line}`
    })
    .join('\n')

  return {
    selectionEnd: lineStart + nextBlock.length,
    selectionStart: lineStart,
    value: replaceRange(value, lineStart, lineEnd, nextBlock),
  }
}

const getNextClozeId = (value: string) => {
  const matches = value.matchAll(/\{\{c(\d+)::/g)
  let maxId = 0

  for (const match of matches) {
    maxId = Math.max(maxId, Number(match[1]))
  }

  return `c${maxId + 1}`
}

const replaceRange = (
  value: string,
  start: number,
  end: number,
  replacement: string,
) => `${value.slice(0, start)}${replacement}${value.slice(end)}`
