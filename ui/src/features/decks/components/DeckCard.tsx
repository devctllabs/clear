import { useNavigate } from '@tanstack/react-router'
import { ArrowRight, Clock3, Pencil, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { LazyIconGlyph } from '@shared/components/icons/IconGlyph'
import {
  InventoryRowShell,
  inventoryRowOverlayClassName,
} from '@shared/components/data/InventoryList'
import { ProgressRing } from '@shared/components/data/ProgressRing'
import { ActionMenu } from '@shared/components/feedback/ActionMenu'
import { Button } from '@shared/components/ui/button'
import { Card } from '@shared/components/ui/card'
import { focusRingClassName } from '@shared/components/ui/focus'
import {
  createOpenedFromState,
  saveReviewReturnTarget,
} from '@shared/lib/navigation-state'
import { cn } from '@shared/lib/utils'
import { useDateFormatters } from '@shared/lib/translated-date-format'
import {
  formatNonNegativeInteger,
  normalizeNonNegativeInteger,
} from '@shared/lib/number-format'

import type { Deck } from '../types/deck.types'

export type DeckCardProps = {
  className?: string
  deck: Deck
  onDelete: (deck: Deck) => void
  onEdit: (deck: Deck) => void
  onOpen: (deck: Deck) => void
  onReview: (deck: Deck) => void
  surface?: 'card' | 'row'
}

export const DeckCard = ({
  className,
  deck,
  onDelete,
  onEdit,
  onOpen,
  onReview,
  surface = 'card',
}: DeckCardProps) => {
  const { t } = useTranslation()
  const { formatRelativeDate } = useDateFormatters()
  const deckTitle = deck.title.trim()
  const dueToday = normalizeNonNegativeInteger(deck.dueToday)
  const dueTodayLabel = formatNonNegativeInteger(deck.dueToday)
  const hasDueToday = dueToday > 0
  const openDeckLabel = t(($) => $.decks.actions.openDeck, { title: deckTitle })
  const deckActionsLabel = t(($) => $.decks.actions.actionMenu, { title: deckTitle })
  const reviewLabel = t(($) => $.common.actions.review)
  const dueTodayA11yLabel = t(($) => $.decks.labels.dueToday)

  const openDeck = () => {
    onOpen(deck)
  }

  if (surface === 'row') {
    return (
      <InventoryRowShell
        className={cn(
          'grid-cols-[auto_minmax(0,1fr)_auto] gap-x-3 gap-y-3 px-4 py-4 sm:grid-cols-[auto_minmax(0,1fr)_auto_auto] sm:gap-x-4 sm:px-5',
          className,
        )}
      >
        <Button
          aria-label={openDeckLabel}
          className={inventoryRowOverlayClassName}
          type="button"
          onClick={openDeck}
        />
        <div className="pointer-events-none relative z-20 flex size-10 shrink-0 items-center justify-center rounded-full bg-muted">
          <span className="inline-flex size-4.5 items-center justify-center text-foreground">
            <LazyIconGlyph name={deck.icon} />
          </span>
        </div>
        <div className="pointer-events-none relative z-20 min-w-0">
          <h3 className="line-clamp-2 text-wrap-anywhere type-row-title text-primary">
            {deckTitle}
          </h3>
          <p className="mt-1 line-clamp-2 text-wrap-anywhere text-xs font-medium text-muted-foreground">
            {formatRelativeDate(deck.updatedAt)}
          </p>
        </div>
        <div className="pointer-events-auto relative z-20 col-start-3 row-start-1 justify-self-end sm:col-start-4 sm:-translate-y-2 sm:self-start">
          <ActionMenu
            ariaLabel={deckActionsLabel}
            items={[
              {
                icon: <Pencil className="size-4 stroke-[2.4]" />,
                label: t(($) => $.common.actions.edit),
                onSelect: () => {
                  onEdit(deck)
                },
              },
              {
                icon: <Trash2 className="size-4 stroke-[2.2]" />,
                label: t(($) => $.common.actions.delete),
                onSelect: () => onDelete(deck),
                tone: 'danger',
              },
            ]}
            triggerFocusSurface="card"
          />
        </div>
        <div className="pointer-events-none relative z-20 col-start-2 col-end-4 row-start-2 flex min-w-0 flex-wrap items-center gap-2 min-[380px]:gap-x-4 min-[380px]:gap-y-3 sm:col-end-5">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex min-w-0 shrink-0 items-center gap-1.5">
              <Clock3
                aria-hidden="true"
                className="size-3.5 shrink-0 text-muted-foreground"
                strokeWidth={2.3}
              />
              <span className="sr-only">{dueTodayA11yLabel}: </span>
              <span className="type-technical text-xs font-bold leading-none text-foreground">
                {dueTodayLabel}
              </span>
            </div>
            <ProgressRing
              size={34}
              strokeWidth={2.5}
              value={deck.progress}
              valueClassName="type-technical text-[9px] font-bold"
            />
          </div>
          <Button
            className={cn(
              'type-action pointer-events-auto h-9 shrink-0 rounded-full px-3.5 transition-[background-color,color,transform] active:scale-95 min-[380px]:ml-auto min-[380px]:h-10 min-[380px]:px-5',
              hasDueToday
                ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                : 'border border-border bg-card text-foreground hover:bg-muted',
            )}
            type="button"
            variant="default"
            onClick={(event) => {
              event.stopPropagation()
              onReview(deck)
            }}
          >
            {reviewLabel}
            <ArrowRight className="size-4" />
          </Button>
        </div>
      </InventoryRowShell>
    )
  }

  return (
    <Card
      className={cn(
        'relative isolate flex w-full min-w-0 max-w-full cursor-pointer flex-col gap-6 rounded-card border border-border bg-card p-6 shadow-card',
        className,
      )}
    >
      <Button
        aria-label={openDeckLabel}
        className={cn(
          focusRingClassName,
          'absolute inset-0 z-10 cursor-pointer rounded-card text-left focus-visible:ring-inset focus-visible:ring-offset-0',
        )}
        type="button"
        onClick={openDeck}
      />
      <div className="pointer-events-none relative z-20 flex min-w-0 items-start justify-between gap-4">
        <div className="flex min-w-0 flex-1 items-center gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-muted">
            <span className="inline-flex size-5 items-center justify-center text-foreground">
              <LazyIconGlyph name={deck.icon} />
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="line-clamp-2 text-wrap-anywhere type-row-title text-primary">
              {deckTitle}
            </h3>
            <p className="mt-0.5 line-clamp-2 text-wrap-anywhere text-xs font-medium text-muted-foreground">
              {formatRelativeDate(deck.updatedAt)}
            </p>
          </div>
        </div>
        <div className="pointer-events-auto shrink-0">
          <ActionMenu
            ariaLabel={deckActionsLabel}
            items={[
              {
                icon: <Pencil className="size-4 stroke-[2.4]" />,
                label: t(($) => $.common.actions.edit),
                onSelect: () => {
                  onEdit(deck)
                },
              },
              {
                icon: <Trash2 className="size-4 stroke-[2.2]" />,
                label: t(($) => $.common.actions.delete),
                onSelect: () => onDelete(deck),
                tone: 'danger',
              },
            ]}
            triggerFocusSurface="card"
          />
        </div>
      </div>
      <div className="pointer-events-none relative z-20 flex min-w-0 flex-wrap items-center justify-between gap-x-4 gap-y-4">
        <div className="flex min-w-0 items-center gap-4">
          <div className="flex min-w-0 shrink-0 items-center gap-2">
            <Clock3
              aria-hidden="true"
              className="size-4 shrink-0 text-muted-foreground"
              strokeWidth={2.3}
            />
            <span className="sr-only">{dueTodayA11yLabel}: </span>
            <span className="type-metric text-primary">
              {dueTodayLabel}
            </span>
          </div>
          <ProgressRing value={deck.progress} />
        </div>
        <Button
          className={cn(
            'type-action pointer-events-auto ml-auto h-auto rounded-full px-8 py-3.5 transition-[background-color,color,transform] active:scale-95',
            hasDueToday
              ? 'bg-primary text-primary-foreground hover:bg-primary/90'
              : 'border border-border bg-card text-foreground hover:bg-muted',
          )}
          type="button"
          variant="default"
          onClick={(event) => {
            event.stopPropagation()
            onReview(deck)
          }}
        >
          {reviewLabel}
          <ArrowRight className="size-4" />
        </Button>
      </div>
    </Card>
  )
}

export const ConnectedDeckCard = ({
  className,
  deck,
  onDelete,
  openedFrom,
  surface,
}: {
  className?: string
  deck: Deck
  onDelete: (deck: Deck) => void
  openedFrom?: string
  surface?: DeckCardProps['surface']
}) => {
  const navigate = useNavigate()

  return (
    <DeckCard
      className={className}
      deck={deck}
      surface={surface}
      onDelete={onDelete}
      onEdit={(selectedDeck) => {
        void navigate({
          params: { deckId: selectedDeck.id, workspaceId: selectedDeck.workspaceId },
          state: openedFrom ? createOpenedFromState(openedFrom) : undefined,
          to: '/dashboard/$workspaceId/decks/$deckId/edit',
        })
      }}
      onOpen={(selectedDeck) => {
        void navigate({
          params: { deckId: selectedDeck.id, workspaceId: selectedDeck.workspaceId },
          state: openedFrom ? createOpenedFromState(openedFrom) : undefined,
          to: '/dashboard/$workspaceId/decks/$deckId',
        })
      }}
      onReview={(selectedDeck) => {
        if (openedFrom) {
          saveReviewReturnTarget(selectedDeck.workspaceId, selectedDeck.id, openedFrom)
        }

        void navigate({
          params: {
            deckId: selectedDeck.id,
            workspaceId: selectedDeck.workspaceId,
          },
          to: '/dashboard/$workspaceId/decks/$deckId/review',
        })
      }}
    />
  )
}
