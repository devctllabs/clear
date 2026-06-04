import { Folder } from 'lucide-react'

import { SectionHeading } from '@shared/components/layout/Screen'
import { Card } from '@shared/components/ui/card'
import { editorFieldFocusClassName } from '@shared/components/ui/focus'
import {
  formatCompactLocationPath,
  formatLocationPathLabel,
} from '@shared/lib/location-path'
import { cn } from '@shared/lib/utils'

export const FolderEditorForm = ({
  description,
  locationPath,
  name,
  onDescriptionChange,
  onNameChange,
}: {
  description: string
  locationPath?: string[]
  name: string
  onDescriptionChange: (value: string) => void
  onNameChange: (value: string) => void
}) => {
  const locationLabel = locationPath ? formatLocationPathLabel(locationPath) : undefined
  const compactLocationLabel = locationPath
    ? formatCompactLocationPath(locationPath)
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
        <SectionHeading>Name</SectionHeading>
        <label className="sr-only" htmlFor="folder-name">
          Folder name
        </label>
        <textarea
          autoComplete="off"
          className={cn(
            'text-wrap-anywhere type-page-title mt-4 block min-h-20 w-full resize-none overflow-hidden border-0 bg-transparent p-0 text-foreground placeholder:text-muted-foreground/45',
            editorFieldFocusClassName,
          )}
          id="folder-name"
          name="folder-name"
          placeholder="Folder name"
          rows={2}
          value={name}
          onChange={(event) => onNameChange(event.target.value)}
        />
      </div>
      <hr className="mx-8 border-t border-border" />
      <div className="px-8 py-8">
        <SectionHeading>Description</SectionHeading>
        <label className="sr-only" htmlFor="folder-description">
          Folder description
        </label>
        <textarea
          autoComplete="off"
          className={cn(
            'mt-4 block min-h-36 w-full resize-none border-0 bg-transparent p-0 text-lg leading-relaxed text-foreground placeholder:text-muted-foreground/45',
            editorFieldFocusClassName,
          )}
          id="folder-description"
          name="folder-description"
          placeholder="What belongs in this folder?"
          rows={5}
          value={description}
          onChange={(event) => onDescriptionChange(event.target.value)}
        />
      </div>
    </Card>
  )
}
