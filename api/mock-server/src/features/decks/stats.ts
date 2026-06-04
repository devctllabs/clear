import type { NoteDetailRecord } from '../../generated/mock-admin/contract/index.ts'

export const summarizeDeckNotes = (
  notes: Array<Pick<NoteDetailRecord, 'deletedAt' | 'dueAt' | 'progress'>>,
  updatedAt: string,
) => {
  const visibleNotes = notes.filter((note) => !note.deletedAt)
  const totalNotes = visibleNotes.length
  const dueToday = visibleNotes.filter((note) => note.dueAt <= updatedAt).length
  const progress =
    totalNotes === 0
      ? 0
      : Math.round(visibleNotes.reduce((sum, note) => sum + note.progress, 0) / totalNotes)

  return {
    dueToday,
    progress,
    totalNotes,
  }
}
