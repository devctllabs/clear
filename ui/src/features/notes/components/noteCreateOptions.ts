import { FileText, Sparkles, type LucideIcon } from 'lucide-react'

import type { NoteKind } from '../types/note.types'

import type { TFunction } from 'i18next'

export type NoteCreateOption = Readonly<{
  Icon: LucideIcon
  kind: NoteKind
}>

export const noteCreateOptions = [
  {
    Icon: FileText,
    kind: 'basic',
  },
  {
    Icon: Sparkles,
    kind: 'cloze',
  },
] as const satisfies readonly NoteCreateOption[]

export const getNoteKindLabel = (t: TFunction, kind: NoteKind) =>
  kind === 'basic'
    ? t(($) => $.notes.labels.basic)
    : t(($) => $.notes.labels.cloze)
