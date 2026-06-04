import type { Deck } from '@features/decks'
import type { Folder } from '@features/folders'
import type { Workspace } from '@features/workspaces'
import { ConfirmDialog } from '@shared/components/feedback/ConfirmDialog'
import { useTranslation } from 'react-i18next'

type ActionError = {
  error: unknown
  title: string
} | null

export const DashboardDeleteDialogs = ({
  deckActionError,
  deletingDeck,
  deletingFolder,
  deletingWorkspace,
  folderActionError,
  pendingDeck,
  pendingFolder,
  pendingWorkspace,
  workspaceActionError,
  onCloseDeck,
  onCloseFolder,
  onCloseWorkspace,
  onConfirmDeck,
  onConfirmFolder,
  onConfirmWorkspace,
}: {
  deckActionError: ActionError
  deletingDeck: boolean
  deletingFolder: boolean
  deletingWorkspace: boolean
  folderActionError: ActionError
  pendingDeck: Deck | null
  pendingFolder: Folder | null
  pendingWorkspace: Workspace | null
  workspaceActionError: ActionError
  onCloseDeck: () => void
  onCloseFolder: () => void
  onCloseWorkspace: () => void
  onConfirmDeck: () => void
  onConfirmFolder: () => void
  onConfirmWorkspace: () => void
}) => (
  <DashboardDeleteDialogsContent
    deckActionError={deckActionError}
    deletingDeck={deletingDeck}
    deletingFolder={deletingFolder}
    deletingWorkspace={deletingWorkspace}
    folderActionError={folderActionError}
    pendingDeck={pendingDeck}
    pendingFolder={pendingFolder}
    pendingWorkspace={pendingWorkspace}
    workspaceActionError={workspaceActionError}
    onCloseDeck={onCloseDeck}
    onCloseFolder={onCloseFolder}
    onCloseWorkspace={onCloseWorkspace}
    onConfirmDeck={onConfirmDeck}
    onConfirmFolder={onConfirmFolder}
    onConfirmWorkspace={onConfirmWorkspace}
  />
)

const DashboardDeleteDialogsContent = ({
  deckActionError,
  deletingDeck,
  deletingFolder,
  deletingWorkspace,
  folderActionError,
  pendingDeck,
  pendingFolder,
  pendingWorkspace,
  workspaceActionError,
  onCloseDeck,
  onCloseFolder,
  onCloseWorkspace,
  onConfirmDeck,
  onConfirmFolder,
  onConfirmWorkspace,
}: Parameters<typeof DashboardDeleteDialogs>[0]) => {
  const { t } = useTranslation()

  return (
    <>
      <ConfirmDialog
        actionError={workspaceActionError}
        confirmLabel={t(($) => $.workspaces.actions.deleteWorkspace)}
        confirming={deletingWorkspace}
        description={
          pendingWorkspace
            ? t(($) => $.workspaces.dialogs.deleteWorkspaceDescription, { title: pendingWorkspace.title })
            : t(($) => $.workspaces.dialogs.deleteWorkspaceFallbackDescription)
        }
        open={pendingWorkspace !== null}
        title={
          pendingWorkspace
            ? t(($) => $.workspaces.dialogs.deleteWorkspaceTitle, { title: pendingWorkspace.title })
            : t(($) => $.workspaces.dialogs.deleteWorkspaceFallbackTitle)
        }
        onConfirm={onConfirmWorkspace}
        onOpenChange={(open) => {
          if (!open) {
            onCloseWorkspace()
          }
        }}
      />
      <ConfirmDialog
        actionError={folderActionError}
        confirmLabel={t(($) => $.folders.actions.deleteFolder)}
        confirming={deletingFolder}
        description={
          pendingFolder
            ? t(($) => $.folders.dialogs.deleteFolderDescription, { name: pendingFolder.name })
            : t(($) => $.folders.dialogs.deleteFolderFallbackDescription)
        }
        open={pendingFolder !== null}
        title={
          pendingFolder
            ? t(($) => $.folders.dialogs.deleteFolderTitle, { name: pendingFolder.name })
            : t(($) => $.folders.dialogs.deleteFolderFallbackTitle)
        }
        onConfirm={onConfirmFolder}
        onOpenChange={(open) => {
          if (!open) {
            onCloseFolder()
          }
        }}
      />
      <ConfirmDialog
        actionError={deckActionError}
        confirmLabel={t(($) => $.decks.actions.deleteDeck)}
        confirming={deletingDeck}
        description={
          pendingDeck
            ? t(($) => $.decks.dialogs.deleteDeckDescription, { title: pendingDeck.title })
            : t(($) => $.decks.dialogs.deleteDeckFallbackDescription)
        }
        open={pendingDeck !== null}
        title={
          pendingDeck
            ? t(($) => $.decks.dialogs.deleteDeckTitle, { title: pendingDeck.title })
            : t(($) => $.decks.dialogs.deleteDeckFallbackTitle)
        }
        onConfirm={onConfirmDeck}
        onOpenChange={(open) => {
          if (!open) {
            onCloseDeck()
          }
        }}
      />
    </>
  )
}
