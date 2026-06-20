import type { VisualIconName } from '@shared/components/icons/IconGlyph'
import type { SortPreference } from '@shared/types/sort.types'

export const deckSortFields = ['title', 'updatedAt', 'dueToday'] as const

export type DeckSortField = (typeof deckSortFields)[number]

export type DeckSortPreference = SortPreference<DeckSortField>

export const defaultDeckSortPreference: DeckSortPreference = {
  direction: 'asc',
  field: 'title',
}

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
