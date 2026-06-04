import { useNavigate } from '@tanstack/react-router'
import { useState } from 'react'

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
  const locationPath = isRootTarget ? ['Workspace'] : folderPathQuery.data

  return (
    <EditorShell
      actionLabel="Create deck"
      actionError={
        createDeck.isError ? { error: createDeck.error, title: 'Could not create deck' } : null
      }
      backTo={closeTo}
      isSubmitting={createDeck.isPending}
      title="Create Deck"
      onSubmit={() => {
        createDeck.mutate(
          {
            description: description.trim() || 'Focused study deck.',
            icon,
            parentId: targetFolderId,
            title: title.trim() || 'Untitled Deck',
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
          title="Could not load folder path"
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
