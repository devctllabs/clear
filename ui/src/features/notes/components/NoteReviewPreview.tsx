import { useMemo, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { MarkdownContent } from '@shared/components/data/MarkdownContent'
import { Button } from '@shared/components/ui/button'
import { IconButton } from '@shared/components/ui/icon-button'
import { cn } from '@shared/lib/utils'

import type { BasicNoteEditor, ClozeNoteEditor } from '../types/note.types'

type NoteReviewPreviewProps =
  | {
      draft: BasicNoteEditor
      kind: 'basic'
    }
  | {
      draft: ClozeNoteEditor
      kind: 'cloze'
    }

export const extractClozeIds = (markdown: string): string[] => {
  const ids: string[] = []
  const pattern = /\{\{(c\d+)::/g
  let match: RegExpExecArray | null

  while ((match = pattern.exec(markdown)) !== null) {
    if (!ids.includes(match[1])) {
      ids.push(match[1])
    }
  }

  return ids
}

export const NoteReviewPreview = ({ draft, kind }: NoteReviewPreviewProps) => {
  const { t } = useTranslation()
  const [isRevealed, setIsRevealed] = useState(false)

  return (
    <article
      className="overflow-hidden rounded-card border border-border bg-card px-6 py-6 shadow-card sm:px-8"
      data-slot="note-review-preview"
    >
      <div className="mb-8 flex min-w-0 items-center justify-between gap-4">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <span className="type-label rounded-full bg-muted px-3 py-1 uppercase text-muted-foreground">
            {t(($) => $.review.labels.review)}
          </span>
          <span className="type-label rounded-full bg-muted px-3 py-1 uppercase text-muted-foreground">
            {kind === 'basic'
              ? t(($) => $.notes.labels.basicUppercase)
              : t(($) => $.notes.labels.clozeUppercase)}
          </span>
        </div>
        <IconButton
          aria-pressed={isRevealed}
          className={cn(
            'border border-border bg-card text-muted-foreground',
            isRevealed && 'bg-muted text-foreground',
          )}
          focusSurface="card"
          icon={isRevealed ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          label={t(($) => $.review.actions.showAnswer)}
          size="lg"
          title={t(($) => $.review.actions.showAnswer)}
          type="button"
          onClick={() => setIsRevealed((revealed) => !revealed)}
        />
      </div>

      {kind === 'basic' ? (
        <BasicNoteReviewPreview draft={draft} revealed={isRevealed} />
      ) : (
        <ClozeNoteReviewPreview draft={draft} revealed={isRevealed} />
      )}
    </article>
  )
}

const PreviewLabel = ({ children }: { children: string }) => (
  <span className="type-label block uppercase text-muted-foreground">
    {children}
  </span>
)

const PreviewPlaceholder = ({ children }: { children: string }) => (
  <p className="text-wrap-anywhere type-reading text-muted-foreground/70">
    {children}
  </p>
)

const BasicNoteReviewPreview = ({
  draft,
  revealed,
}: {
  draft: BasicNoteEditor
  revealed: boolean
}) => {
  const { t } = useTranslation()
  const front = draft.front.trim()
  const back = draft.back.trim()

  return (
    <div className="space-y-8">
      <section className="min-w-0 space-y-4">
        <PreviewLabel>{t(($) => $.notes.labels.frontUppercase)}</PreviewLabel>
        {front ? (
          <MarkdownContent className="text-lg" markdown={front} />
        ) : (
          <PreviewPlaceholder>{t(($) => $.notes.fields.frontPlaceholder)}</PreviewPlaceholder>
        )}
      </section>

      {revealed ? (
        <>
          <div className="h-px w-full bg-muted" />
          <section className="min-w-0 space-y-4">
            <PreviewLabel>{t(($) => $.notes.labels.backUppercase)}</PreviewLabel>
            {back ? (
              <MarkdownContent className="text-lg" markdown={back} />
            ) : (
              <PreviewPlaceholder>{t(($) => $.notes.fields.backPlaceholder)}</PreviewPlaceholder>
            )}
          </section>
        </>
      ) : null}
    </div>
  )
}

const ClozeNoteReviewPreview = ({
  draft,
  revealed,
}: {
  draft: ClozeNoteEditor
  revealed: boolean
}) => {
  const { t } = useTranslation()
  const clozeIds = useMemo(() => extractClozeIds(draft.body), [draft.body])
  const [selectedClozeId, setSelectedClozeId] = useState<string | null>(null)
  const activeClozeId =
    selectedClozeId && clozeIds.includes(selectedClozeId)
      ? selectedClozeId
      : clozeIds[0]
  const body = draft.body.trim()

  return (
    <div className="space-y-6">
      {clozeIds.length > 1 ? (
        <div className="quiet-scrollbar flex gap-2 overflow-x-auto pb-1">
          {clozeIds.map((clozeId) => (
            <Button
              aria-pressed={activeClozeId === clozeId}
              className={cn(
                'type-label inline-flex h-8 min-w-0 items-center justify-center rounded-full border border-border px-3 uppercase transition-colors',
                activeClozeId === clozeId
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
              focusSurface="card"
              key={clozeId}
              type="button"
              onClick={() => setSelectedClozeId(clozeId)}
            >
              {clozeId}
            </Button>
          ))}
        </div>
      ) : null}

      <section className="min-w-0 space-y-4">
        <PreviewLabel>{t(($) => $.notes.labels.noteBody)}</PreviewLabel>
        {body ? (
          <MarkdownContent
            activeClozeId={activeClozeId}
            className="text-lg"
            clozeMode={activeClozeId ? 'review' : 'none'}
            markdown={body}
            revealed={revealed}
          />
        ) : (
          <PreviewPlaceholder>{t(($) => $.notes.fields.bodyPlaceholder)}</PreviewPlaceholder>
        )}
      </section>

      {clozeIds.length === 0 ? (
        <div className="rounded-panel bg-muted px-5 py-4">
          <h2 className="type-row-title text-foreground">
            {t(($) => $.notes.labels.clozeFormat)}
          </h2>
          <p className="text-wrap-anywhere mt-2 text-sm leading-6 text-muted-foreground">
            {t(($) => $.notes.descriptions.clozeFormatPrefix)}{' '}
            <span className="font-bold text-foreground">{'{{c1::...}}'}</span>.{' '}
            {t(($) => $.notes.descriptions.clozeFormat)}
          </p>
        </div>
      ) : null}
    </div>
  )
}
