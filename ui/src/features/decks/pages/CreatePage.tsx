import { useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import type { VisualIconName } from '@shared/components/icons/IconGlyph'
import { useFolderPath } from '@features/folders/hooks/useFolders'
import { InlineErrorState } from '@shared/components/feedback/LoadErrorState'
import { EditorShell } from '@shared/components/layout/EditorShell'
import { useCloseTarget } from '@shared/lib/navigation-state'

import { DeckEditorForm } from '../components/DeckEditorForm'
import { defaultDeckVisualIcon } from '../constants/visuals'
import { useCreateDeck } from '../hooks/useDecks'

export const DeckCreatePage = ({
  folderId,
  workspaceId,
}: {
  folderId?: string
  workspaceId: string
}) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const createDeck = useCreateDeck()
  const targetFolderId = folderId ?? workspaceId
  const isRootTarget = targetFolderId === workspaceId
  const folderPathQuery = useFolderPath(isRootTarget ? '' : targetFolderId)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [icon, setIcon] = useState<VisualIconName>(defaultDeckVisualIcon)
  const backTo = isRootTarget
    ? `/dashboard/${workspaceId}`
    : `/dashboard/${workspaceId}/folders/${targetFolderId}`
  const closeTo = useCloseTarget(backTo)
  const locationPath = isRootTarget ? [t(($) => $.workspaces.labels.workspace)] : folderPathQuery.data

  return (
    <EditorShell
      actionLabel={t(($) => $.decks.actions.createDeck)}
      actionError={
        createDeck.isError
          ? { error: createDeck.error, title: t(($) => $.decks.errors.couldNotCreateDeck) }
          : null
      }
      backTo={closeTo}
      isSubmitting={createDeck.isPending}
      title={t(($) => $.decks.labels.createDeckTitle)}
      onSubmit={() => {
        createDeck.mutate(
          {
            description: description.trim() || t(($) => $.decks.descriptions.editorDefault),
            icon,
            parentId: targetFolderId,
            title: title.trim() || t(($) => $.decks.fields.untitledDeck),
          },
          {
            onSuccess: (deck) => {
              void navigate({
                params: { deckId: deck.id, workspaceId },
                to: '/dashboard/$workspaceId/decks/$deckId',
              })
            },
          },
        )
      }}
    >
      {folderPathQuery.isError && folderPathQuery.data === undefined ? (
        <InlineErrorState
          className="mb-5"
          error={folderPathQuery.error}
          title={t(($) => $.decks.errors.couldNotLoadFolderPath)}
        />
      ) : null}
      <DeckEditorForm
        description={description}
        icon={icon}
        locationPath={locationPath}
        title={title}
        onDescriptionChange={setDescription}
        onIconChange={setIcon}
        onTitleChange={setTitle}
      />
    </EditorShell>
  )
}
