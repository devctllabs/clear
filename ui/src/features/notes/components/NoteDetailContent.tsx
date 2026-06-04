import { useId, useState, type ReactNode } from 'react'
import { CalendarDays, Clock3, Info } from 'lucide-react'

import { MarkdownContent } from '@shared/components/data/MarkdownContent'
import { IconButton } from '@shared/components/ui/icon-button'
import {
  formatDueLabel,
  formatReviewedLabel,
  formatUpdatedChipLabel,
} from '@shared/lib/date-format'
import { formatPercentage } from '@shared/lib/number-format'
import { cn } from '@shared/lib/utils'

import type { ClozeNoteCard, NoteDetail } from '../types/note.types'

type NoteDetailContentVariant = 'mobile' | 'desktop'

const basicProgressHeading = 'STUDY PROGRESS'
const clozeBodyHeading = 'NOTE BODY'
const clozeCardsHelperText = 'Notes are the source of truth for derived cards.'

export const NoteDetailContent = ({
  note,
  variant = 'mobile',
}: {
  note: NoteDetail
  variant?: NoteDetailContentVariant
}) => {
  if (note.kind === 'basic') {
    return <BasicNoteDetailCard note={note} variant={variant} />
  }

  return <ClozeNoteDetailCard note={note} variant={variant} />
}

const NoteDetailSurface = ({ children }: { children: ReactNode }) => (
  <article className="min-w-0 overflow-hidden rounded-card border border-border bg-card shadow-card">
    {children}
  </article>
)

const MetadataChip = ({ label }: { label: string }) => (
  <span className="text-wrap-anywhere type-label inline-flex max-w-full rounded-full bg-muted px-3 py-1 uppercase text-muted-foreground">
    {label}
  </span>
)

const NoteKindChip = ({ note }: { note: NoteDetail }) => (
  <MetadataChip label={note.kind === 'basic' ? 'BASIC' : 'CLOZE'} />
)

const formatNoteStatusLabel = (status: NoteDetail['status']) =>
  status === 'mastered' ? 'MASTERED' : 'IN PROGRESS'

const DesktopNoteKindChip = ({ note }: { note: NoteDetail }) => (
  <div className="px-8 pt-8">
    <NoteKindChip note={note} />
  </div>
)

const LinearProgress = ({ value }: { value: number }) => (
  <div className="h-1.5 overflow-hidden rounded-full bg-muted">
    <div className="h-full rounded-full bg-primary" style={{ width: formatPercentage(value) }} />
  </div>
)

const DetailSectionHeading = ({ children }: { children: ReactNode }) => (
  <h2 className="type-label uppercase text-muted-foreground">
    {children}
  </h2>
)

const BasicNoteDetailCard = ({
  note,
  variant,
}: {
  note: Extract<NoteDetail, { kind: 'basic' }>
  variant: NoteDetailContentVariant
}) => (
  <NoteDetailSurface>
    {variant === 'desktop' ? <DesktopNoteKindChip note={note} /> : null}

    {variant === 'mobile' ? (
      <div className="px-8 pt-8">
        <div className="flex min-w-0 flex-wrap gap-2">
          <NoteKindChip note={note} />
          <MetadataChip label={formatUpdatedChipLabel(note.updatedAt)} />
        </div>
      </div>
    ) : null}

    {variant === 'mobile' ? (
      <>
        <div className="px-8 pb-8 pt-8">
          <DetailSectionHeading>TITLE</DetailSectionHeading>
          <h2 className="text-wrap-anywhere type-study-title mt-4 text-foreground">
            {note.title}
          </h2>
        </div>

        <hr className="mx-8 border-t border-border" />
      </>
    ) : null}

    <div className="px-8 py-8">
      <p className="type-label uppercase text-muted-foreground">
        FRONT
      </p>
      <MarkdownContent className="mt-4 text-lg" markdown={note.editor.front} />
    </div>

    <hr className="mx-8 border-t border-border" />

    <div className="px-8 py-8">
      <p className="type-label uppercase text-muted-foreground">
        BACK
      </p>
      <MarkdownContent className="mt-4 text-lg" markdown={note.editor.back} />
    </div>

    {variant === 'mobile' ? (
      <>
        <hr className="mx-8 border-t border-border" />

        <div className="px-8 py-8">
          <div className="mb-6 flex min-w-0 items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <DetailSectionHeading>{basicProgressHeading}</DetailSectionHeading>
              <h3 className="type-metric mt-1 text-foreground">
                {formatPercentage(note.progress)}
              </h3>
            </div>
            <span className="text-wrap-anywhere type-label max-w-[11rem] shrink-0 rounded-full bg-muted px-3 py-1 text-right uppercase text-muted-foreground">
              {formatNoteStatusLabel(note.status)}
            </span>
          </div>

          <LinearProgress value={note.progress} />

          <div className="mt-6 flex min-w-0 flex-wrap items-center gap-4">
            <div className="flex min-w-0 items-center gap-2 text-sm text-muted-foreground">
              <CalendarDays className="size-4 shrink-0" />
              <span className="text-wrap-anywhere min-w-0">
                {formatReviewedLabel(note.reviewedAt)}
              </span>
            </div>
            <div className="h-1 w-1 rounded-full bg-muted-foreground/35" />
            <div className="flex min-w-0 items-center gap-2 text-sm text-muted-foreground">
              <Clock3 className="size-4 shrink-0" />
              <span className="text-wrap-anywhere min-w-0">{formatDueLabel(note.dueAt)}</span>
            </div>
          </div>
        </div>
      </>
    ) : null}
  </NoteDetailSurface>
)

const ClozeNoteDetailCard = ({
  note,
  variant,
}: {
  note: Extract<NoteDetail, { kind: 'cloze' }>
  variant: NoteDetailContentVariant
}) => (
  <NoteDetailSurface>
    {variant === 'desktop' ? <DesktopNoteKindChip note={note} /> : null}

    {variant === 'mobile' ? (
      <div className="px-8 pt-8">
        <div className="flex min-w-0 flex-wrap gap-2">
          <NoteKindChip note={note} />
          <MetadataChip label={formatUpdatedChipLabel(note.updatedAt)} />
        </div>
      </div>
    ) : null}

    {variant === 'mobile' ? (
      <>
        <div className="px-8 pb-8 pt-8">
          <DetailSectionHeading>TITLE</DetailSectionHeading>
          <h2 className="text-wrap-anywhere type-study-title mt-4 text-foreground">
            {note.title}
          </h2>
        </div>

        <hr className="mx-8 border-t border-border" />
      </>
    ) : null}

    <div className="px-8 py-8">
      <DetailSectionHeading>{clozeBodyHeading}</DetailSectionHeading>
      <MarkdownContent
        className="mt-4 text-lg"
        clozeMode="all"
        markdown={note.editor.body}
      />
    </div>

    <hr className="mx-8 border-t border-border" />

    <div className="px-8 py-8">
      <DerivedCardsHeading />
      <div className="mt-3 space-y-8">
        {note.cards.map((card) => (
          <DerivedCardGroup card={card} key={card.id} />
        ))}
      </div>
    </div>
  </NoteDetailSurface>
)

const DerivedCardsHeading = () => {
  const helperId = useId()
  const [isHelperVisible, setIsHelperVisible] = useState(false)

  return (
    <div>
      <div className="flex min-w-0 items-center gap-2">
        <DetailSectionHeading>DERIVED CARDS</DetailSectionHeading>
        <IconButton
          aria-controls={helperId}
          aria-expanded={isHelperVisible}
          className="-ml-1 text-muted-foreground hover:bg-accent"
          focusSurface="card"
          icon={<Info className="size-3.5" />}
          label={isHelperVisible ? 'Hide derived cards note' : 'Show derived cards note'}
          size="xs"
          type="button"
          onClick={() => setIsHelperVisible((visible) => !visible)}
        />
      </div>
      <p
        aria-hidden={!isHelperVisible}
        className={cn(
          'min-h-[1.25rem] text-wrap-anywhere text-[11px] font-medium leading-5 text-muted-foreground transition-opacity',
          isHelperVisible ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
        id={helperId}
      >
        {clozeCardsHelperText}
      </p>
    </div>
  )
}

const DerivedCardGroup = ({ card }: { card: ClozeNoteCard }) => (
  <div>
    <div className="mb-3 flex min-w-0 items-start gap-4">
      <div className="mt-1 flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-[12px] font-extrabold text-primary-foreground">
        {card.clozeId}
      </div>
      <div className="min-w-0 flex-1">
        <div className="mb-0.5 flex min-w-0 items-baseline justify-between gap-4">
          <h3 className="text-wrap-anywhere type-row-title min-w-0 flex-1 uppercase text-foreground">
            {card.title}
          </h3>
          <span className="type-row-title shrink-0 text-foreground">
            {formatPercentage(card.progress)}
          </span>
        </div>
        <div className="text-wrap-anywhere text-[11px] font-normal text-muted-foreground">
          {formatReviewedLabel(card.reviewedAt)} <span className="mx-1">·</span>{' '}
          {formatDueLabel(card.dueAt)}
        </div>
      </div>
    </div>

    <LinearProgress value={card.progress} />
  </div>
)
