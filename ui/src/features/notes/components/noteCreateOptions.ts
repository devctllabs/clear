import { FileText, Sparkles, type LucideIcon } from 'lucide-react'

import type { NoteKind } from '../types/note.types'

export type NoteCreateOption = Readonly<{
  Icon: LucideIcon
  kind: NoteKind
  label: string
}>

export const noteCreateOptions = [
  {
    Icon: FileText,
    kind: 'basic',
    label: 'Basic',
  },
  {
    Icon: Sparkles,
    kind: 'cloze',
    label: 'Cloze',
  },
] as const satisfies readonly NoteCreateOption[]
