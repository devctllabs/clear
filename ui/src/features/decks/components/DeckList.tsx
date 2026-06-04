import { InventoryListWithSort } from '@shared/components/data/InventoryListWithSort'
import type { SortPreference } from '@shared/types/sort.types'
import { useTranslation } from 'react-i18next'

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
  const { t } = useTranslation()

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
      sortAriaLabel={t(($) => $.decks.sort.ariaLabel)}
      sortFieldOptions={[
        { field: 'title', label: t(($) => $.decks.sort.title) },
        { field: 'updated', label: t(($) => $.decks.sort.updated) },
        { field: 'dueToday', label: t(($) => $.decks.sort.dueToday) },
      ]}
      title={t(($) => $.decks.labels.decks)}
      onSortChange={onSortChange}
    />
  )
}
