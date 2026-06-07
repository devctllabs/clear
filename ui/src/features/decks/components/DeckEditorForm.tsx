import { Folder } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import type { VisualIconName } from '@shared/components/icons/IconGlyph'
import { FieldValidationMessages } from '@shared/components/forms/FieldValidationMessages'
import { VisualPicker } from '@shared/components/forms/VisualPicker'
import { SectionHeading } from '@shared/components/layout/Screen'
import { Card } from '@shared/components/ui/card'
import { editorFieldFocusClassName } from '@shared/components/ui/focus'
import {
  formatCompactLocationPath,
  formatLocationPathLabel,
} from '@shared/lib/location-path'
import { cn } from '@shared/lib/utils'

import { deckPresetVisualOptions } from '../constants/visuals'

export type DeckEditorValidationMessages = {
  description?: string[]
  icon?: string[]
  title?: string[]
}

export const DeckEditorForm = ({
  description,
  icon,
  locationPath,
  onDescriptionChange,
  onIconChange,
  onTitleChange,
  title,
  validationMessages,
}: {
  description: string
  icon: VisualIconName
  locationPath?: string[]
  onDescriptionChange: (value: string) => void
  onIconChange: (value: VisualIconName) => void
  onTitleChange: (value: string) => void
  title: string
  validationMessages?: DeckEditorValidationMessages
}) => {
  const { t } = useTranslation()
  const locationLabel = locationPath ? formatLocationPathLabel(locationPath) : undefined
  const compactLocationLabel = locationPath
    ? formatCompactLocationPath(locationPath)
    : undefined
  const titleErrorId = validationMessages?.title?.length
    ? 'deck-name-error'
    : undefined
  const descriptionErrorId = validationMessages?.description?.length
    ? 'deck-description-error'
    : undefined
  const iconErrorId = validationMessages?.icon?.length
    ? 'deck-visual-error'
    : undefined

  return (
    <Card className="overflow-hidden rounded-card border border-border bg-card shadow-card">
      {locationLabel && compactLocationLabel ? (
        <div className="px-8 pt-8">
          <span className="inline-flex max-w-full items-center gap-2 rounded-full bg-muted px-4 py-2 text-sm font-bold text-foreground">
            <Folder className="size-4 shrink-0 fill-current stroke-[2.1]" />
            <span
              aria-label={locationLabel}
              className="line-clamp-2 min-w-0 text-wrap-anywhere"
              title={locationLabel}
            >
              {compactLocationLabel}
            </span>
          </span>
        </div>
      ) : null}
      <div className="px-8 pt-8">
        <SectionHeading>{t(($) => $.common.labels.name)}</SectionHeading>
        <label className="sr-only" htmlFor="deck-name">
          {t(($) => $.decks.fields.namePlaceholder)}
        </label>
        <textarea
          autoComplete="off"
          aria-describedby={titleErrorId}
          aria-invalid={validationMessages?.title?.length ? true : undefined}
          className={cn(
            'text-wrap-anywhere type-page-title mt-4 block min-h-20 w-full resize-none overflow-hidden border-0 bg-transparent p-0 text-foreground placeholder:text-muted-foreground/45',
            editorFieldFocusClassName,
          )}
          id="deck-name"
          name="deck-name"
          placeholder={t(($) => $.decks.fields.namePlaceholder)}
          rows={2}
          value={title}
          onChange={(event) => onTitleChange(event.target.value)}
        />
        <FieldValidationMessages id={titleErrorId} messages={validationMessages?.title} />
      </div>
      <hr className="mx-8 border-t border-border" />
      <div className="px-8 py-8">
        <SectionHeading>{t(($) => $.common.labels.description)}</SectionHeading>
        <label className="sr-only" htmlFor="deck-description">
          {t(($) => $.decks.fields.descriptionLabel)}
        </label>
        <textarea
          autoComplete="off"
          aria-describedby={descriptionErrorId}
          aria-invalid={validationMessages?.description?.length ? true : undefined}
          className={cn(
            'mt-4 block min-h-36 w-full resize-none border-0 bg-transparent p-0 text-lg leading-relaxed text-foreground placeholder:text-muted-foreground/45',
            editorFieldFocusClassName,
          )}
          id="deck-description"
          name="deck-description"
          placeholder={t(($) => $.decks.fields.descriptionPlaceholder)}
          rows={5}
          value={description}
          onChange={(event) => onDescriptionChange(event.target.value)}
        />
        <FieldValidationMessages id={descriptionErrorId} messages={validationMessages?.description} />
      </div>
      <hr className="mx-8 border-t border-border" />
      <div className="px-8 py-8">
        <VisualPicker
          description={t(($) => $.decks.descriptions.editorVisual)}
          label={t(($) => $.common.labels.visual)}
          presetOptions={deckPresetVisualOptions}
          value={icon}
          onValueChange={onIconChange}
        />
        <FieldValidationMessages id={iconErrorId} messages={validationMessages?.icon} />
      </div>
    </Card>
  )
}
