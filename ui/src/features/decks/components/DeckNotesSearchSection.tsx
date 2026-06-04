import type { ChangeEventHandler, ReactNode, Ref } from 'react'
import { useTranslation } from 'react-i18next'

import { SearchBox, StickySearch } from '@features/content-search'

export const DeckNotesSearchSection = ({
  children,
  contentRef,
  onQueryChange,
  query,
  searchActive = false,
  variant,
}: {
  children: ReactNode
  contentRef?: Ref<HTMLDivElement>
  onQueryChange: ChangeEventHandler<HTMLInputElement>
  query: string
  searchActive?: boolean
  variant: 'desktop' | 'mobile'
}) => {
  const { t } = useTranslation()
  const deckNotesSearchPlaceholder = t(($) => $.decks.descriptions.notesSearchPlaceholder)

  if (variant === 'desktop') {
    return (
      <section
        aria-label={t(($) => $.decks.labels.deckNotesSearch)}
        className="desktop-detail-main flex min-w-0 max-w-section self-stretch flex-col xl:max-w-none"
      >
        <SearchBox
          className="mb-0 mt-0"
          onChange={onQueryChange}
          placeholder={deckNotesSearchPlaceholder}
          type="text"
          value={query}
        />
        <div className="mt-8 min-h-0 flex-1" ref={contentRef}>
          {children}
        </div>
      </section>
    )
  }

  return (
    <section
      aria-label={t(($) => $.decks.labels.deckNotesSearch)}
      className={searchActive ? '[overflow-anchor:none] min-h-[75dvh] space-y-0' : 'space-y-0'}
    >
      <StickySearch
        onChange={onQueryChange}
        placeholder={deckNotesSearchPlaceholder}
        type="text"
        value={query}
      />
      {children}
    </section>
  )
}
