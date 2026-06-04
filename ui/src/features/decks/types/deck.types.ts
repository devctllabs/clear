import type { VisualIconName } from '@shared/components/icons/IconGlyph'

type DeckBase = {
  description: string
  icon: VisualIconName
  id: string
  parentId: string
  title: string
  updatedAt: string
  workspaceId: string
}

type DeckMetrics = {
  dueToday: number
  progress: number
  totalNotes: number
}

export type Deck = DeckBase & DeckMetrics

export type DeckDetail = DeckBase & DeckMetrics

export type DeckDraft = {
  description: string
  icon: VisualIconName
  parentId: string
  title: string
}
