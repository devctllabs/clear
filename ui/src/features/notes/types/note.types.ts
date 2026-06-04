export type NoteKind = 'basic' | 'cloze'

export type NoteStatus = 'in-progress' | 'mastered'

export type BasicNoteEditor = {
  back: string
  front: string
}

export type ClozeNoteEditor = {
  body: string
}

export type ClozeNoteCard = {
  clozeId: string
  dueAt: string
  id: string
  progress: number
  reviewedAt: string
  status: NoteStatus
  title: string
}

export type BasicNote = {
  deckId: string
  dueAt: string
  editor: BasicNoteEditor
  id: string
  kind: 'basic'
  progress: number
  reviewedAt: string
  status: NoteStatus
  title: string
  updatedAt: string
}

export type ClozeNote = {
  deckId: string
  cards: ClozeNoteCard[]
  dueAt: string
  editor: ClozeNoteEditor
  id: string
  kind: 'cloze'
  progress: number
  reviewedAt: string
  status: NoteStatus
  title: string
  updatedAt: string
}

export type NoteDetail = BasicNote | ClozeNote

export type NoteListItem = {
  dueAt: string
  id: string
  kind: NoteKind
  progress: number
  reviewedAt: string
  status: NoteStatus
  title: string
  updatedAt: string
}

export type NoteRef = {
  deckId: string
  id: string
}

export type NoteDraft =
  | {
      deckId: string
      kind: 'basic'
      title: string
      editor: BasicNoteEditor
    }
  | {
      deckId: string
      kind: 'cloze'
      title: string
      editor: ClozeNoteEditor
    }
