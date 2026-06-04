import { InventoryListWithSort } from '@shared/components/data/InventoryListWithSort'
import type { SortPreference } from '@shared/types/sort.types'

import { ConnectedDeckCard } from './DeckCard'
import type { Deck } from '../types/deck.types'

export const DeckList = ({
  decks,
  onDelete,
  onSortChange,
  openedFrom,
  sort,
}: {
  decks: Deck[]
  onDelete: (deck: Deck) => void
  onSortChange: (sort: SortPreference) => void
  openedFrom?: string
  sort: SortPreference
}) => {
  if (decks.length === 0) {
    return null
  }

  return (
    <InventoryListWithSort
      getItemKey={(deck) => deck.id}
      items={decks}
      renderItem={(deck) => (
        <ConnectedDeckCard
          deck={deck}
          onDelete={onDelete}
          openedFrom={openedFrom}
          surface="row"
        />
      )}
      showSort={decks.length > 1}
      sort={sort}
      sortAriaLabel="Sort decks"
      sortFieldOptions={[
        { field: 'title', label: 'Title' },
        { field: 'updated', label: 'Updated' },
        { field: 'dueToday', label: 'Due Today' },
      ]}
      title="Decks"
      onSortChange={onSortChange}
    />
  )
}
