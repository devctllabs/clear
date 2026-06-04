import { useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'

import type { VisualIconName } from '@shared/components/icons/IconGlyph'
import { useFolderPath } from '@features/folders/hooks/useFolders'
import { InlineErrorState } from '@shared/components/feedback/LoadErrorState'
import { EditorErrorState } from '@shared/components/layout/EditorErrorState'
import { EditorShell } from '@shared/components/layout/EditorShell'
import { EditorLoadingState } from '@shared/components/layout/EditorLoadingState'
import { useCloseTarget } from '@shared/lib/navigation-state'

import { DeckEditorForm } from '../components/DeckEditorForm'
import { defaultDeckVisualIcon } from '../constants/visuals'
import { useDeck, useUpdateDeck } from '../hooks/useDecks'

export const DeckEditPage = ({
  deckId,
  workspaceId,
}: {
  deckId: string
  workspaceId: string
}) => {
  const navigate = useNavigate()
  const deckQuery = useDeck(deckId)
  const currentParentId = deckQuery.data?.parentId ?? workspaceId
  const isRootContainer = currentParentId === workspaceId
  const folderPathQuery = useFolderPath(isRootContainer ? '' : currentParentId)
  const updateDeck = useUpdateDeck(deckId)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [icon, setIcon] = useState<VisualIconName>(defaultDeckVisualIcon)
  const parentLocationPath = isRootContainer ? ['Workspace'] : folderPathQuery.data
  const closeTo = useCloseTarget(`/dashboard/${workspaceId}/decks/${deckId}`)

  useEffect(() => {
    if (!deckQuery.data) {
      return
    }

    setTitle(deckQuery.data.title)
    setDescription(deckQuery.data.description)
    setIcon(deckQuery.data.icon)
  }, [deckQuery.data])

  if (deckQuery.isLoading) {
    return <EditorLoadingState backTo={closeTo} formKind="deck" title="Edit Deck" />
  }

  if (deckQuery.isError && !deckQuery.data) {
    return (
      <EditorErrorState
        backTo={closeTo}
        error={deckQuery.error}
        title="Edit Deck"
        onRetry={() => {
          void deckQuery.refetch()
        }}
      />
    )
  }

  return (
    <EditorShell
      actionLabel="Save changes"
      actionError={
        updateDeck.isError ? { error: updateDeck.error, title: 'Could not save deck' } : null
      }
      backTo={closeTo}
      isSubmitting={updateDeck.isPending}
      title="Edit Deck"
      onSubmit={() => {
        updateDeck.mutate(
          {
            description,
            icon,
            parentId: currentParentId,
            title,
          },
          {
            onSuccess: () => {
              void navigate({
                params: { deckId, workspaceId },
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
        locationPath={parentLocationPath}
        title={title}
        onDescriptionChange={setDescription}
        onIconChange={setIcon}
        onTitleChange={setTitle}
      />
    </EditorShell>
  )
}
