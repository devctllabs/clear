import type { DeckRecord } from '../../generated/mock-admin/contract/index.ts'
import { notFound } from '../../generated/clear-web-api/mock-runtime.ts'
import type { MockStateRepository } from '../../generated/mock-admin/state/repository.ts'
import { visible } from '../../lib/softDelete.ts'
import { byStringField } from '../../lib/sort.ts'

type SortDirection = 'asc' | 'desc'
type DeckSortField = 'dueToday' | 'title' | 'updated'

const sortDecks = (
  decks: DeckRecord[],
  sortField?: DeckSortField,
  sortDirection: SortDirection = 'asc',
) => {
  if (!sortField) {
    return decks
  }

  const direction = sortDirection === 'desc' ? -1 : 1

  return [...decks].sort((left, right) => {
    if (sortField === 'dueToday') {
      return (left.dueToday - right.dueToday) * direction
    }

    if (sortField === 'updated') {
      return left.updatedAt.localeCompare(right.updatedAt) * direction
    }

    return byStringField<DeckRecord>('title', sortDirection)(left, right)
  })
}

export class DeckRepository {
  constructor(private readonly stateStore: MockStateRepository) {}

  all() {
    return this.stateStore.getSlice('decks')
  }

  visible() {
    return visible(this.all())
  }

  find(deckId: string) {
    return this.all().find((deck) => deck.id === deckId)
  }

  require(deckId: string, options: { includeDeleted?: boolean } = {}) {
    const candidates = options.includeDeleted ? this.all() : this.visible()
    const deck = candidates.find((candidate) => candidate.id === deckId)

    if (!deck) {
      throw notFound('deck', deckId)
    }

    return deck
  }

  create(deck: DeckRecord) {
    this.stateStore.setSlice('decks', [deck, ...this.all()])
    return deck
  }

  update(deckId: string, updater: (deck: DeckRecord) => DeckRecord) {
    let next: DeckRecord | undefined

    this.stateStore.setSlice('decks', this.all().map((deck) => {
      if (deck.id !== deckId) {
        return deck
      }

      next = updater(deck)

      return next
    }))

    return next ?? this.require(deckId, { includeDeleted: true })
  }

  touch(deckId: string, updatedAt: string) {
    return this.update(deckId, (deck) => ({ ...deck, updatedAt }))
  }

  markDeleted(deckId: string, deletedAt: string) {
    return this.update(deckId, (deck) => ({ ...deck, deletedAt }))
  }

  restore(deckId: string) {
    return this.update(deckId, (deck) => {
      const { deletedAt: _deletedAt, ...restored } = deck
      return restored
    })
  }

  remove(deckId: string) {
    const existing = this.find(deckId)

    if (!existing) {
      return undefined
    }

    this.stateStore.setSlice('decks', this.all().filter((deck) => deck.id !== deckId))

    return existing
  }

  listByWorkspace(workspaceId: string, options: { sortField?: DeckSortField; sortDirection?: SortDirection } = {}) {
    const decks = this.visible().filter(
      (deck) => deck.workspaceId === workspaceId && deck.parentId === workspaceId,
    )

    return sortDecks(decks, options.sortField, options.sortDirection)
  }

  listByParent(parentId: string, options: { sortField?: DeckSortField; sortDirection?: SortDirection } = {}) {
    const decks = this.visible().filter((deck) => deck.parentId === parentId)

    return sortDecks(decks, options.sortField, options.sortDirection)
  }
}
