import type { DeckRecord } from '../../generated/mock-admin/contract/index.ts'
import { notFound } from '../../generated/clear-web-api/mock-runtime.ts'
import type { MockStateStore } from '../../lib/stateStore.ts'
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
  private readonly stateStore: MockStateStore

  constructor(stateStore: MockStateStore) {
    this.stateStore = stateStore
  }

  all() {
    return this.stateStore.findEntities('decks')
  }

  visible() {
    return visible(this.all())
  }

  find(deckId: string) {
    return this.stateStore.findEntity('decks', deckId)
  }

  require(deckId: string, options: { includeDeleted?: boolean } = {}) {
    const candidates = options.includeDeleted ? this.all() : this.visible()
    const deck = candidates.find((candidate) => candidate.id === deckId)

    if (!deck) {
      throw notFound('deck', deckId)
    }

    return deck
  }

  async create(deck: DeckRecord) {
    return this.stateStore.createEntity('decks', deck, { prepend: true })
  }

  async update(deckId: string, updater: (deck: DeckRecord) => DeckRecord) {
    return (
      await this.stateStore.updateEntity('decks', deckId, updater)
    ) ?? this.require(deckId, { includeDeleted: true })
  }

  async touch(deckId: string, updatedAt: string) {
    return this.update(deckId, (deck) => ({ ...deck, updatedAt }))
  }

  async markDeleted(deckId: string, deletedAt: string) {
    return this.update(deckId, (deck) => ({ ...deck, deletedAt }))
  }

  async restore(deckId: string) {
    return this.update(deckId, (deck) => {
      const { deletedAt: _deletedAt, ...restored } = deck
      return restored
    })
  }

  async remove(deckId: string) {
    return this.stateStore.deleteEntity('decks', deckId)
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
