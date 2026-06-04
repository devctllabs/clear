import type { Deck } from '@features/decks'
import type { Folder } from '@features/folders'
import type { Workspace } from '@features/workspaces'
import { ConfirmDialog } from '@shared/components/feedback/ConfirmDialog'

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
  <>
    <ConfirmDialog
      actionError={workspaceActionError}
      confirmLabel="Delete workspace"
      confirming={deletingWorkspace}
      description={
        pendingWorkspace
          ? `This moves "${pendingWorkspace.title}" to Trash. You can restore it later.`
          : 'This moves this workspace to Trash. You can restore it later.'
      }
      open={pendingWorkspace !== null}
      title={pendingWorkspace ? `Delete "${pendingWorkspace.title}"?` : 'Delete workspace?'}
      onConfirm={onConfirmWorkspace}
      onOpenChange={(open) => {
        if (!open) {
          onCloseWorkspace()
        }
      }}
    />
    <ConfirmDialog
      actionError={folderActionError}
      confirmLabel="Delete folder"
      confirming={deletingFolder}
      description={
        pendingFolder
          ? `This moves "${pendingFolder.name}" to Trash. You can restore it later.`
          : 'This moves this folder to Trash. You can restore it later.'
      }
      open={pendingFolder !== null}
      title={pendingFolder ? `Delete "${pendingFolder.name}"?` : 'Delete folder?'}
      onConfirm={onConfirmFolder}
      onOpenChange={(open) => {
        if (!open) {
          onCloseFolder()
        }
      }}
    />
    <ConfirmDialog
      actionError={deckActionError}
      confirmLabel="Delete deck"
      confirming={deletingDeck}
      description={
        pendingDeck
          ? `This moves "${pendingDeck.title}" to Trash. You can restore it later.`
          : 'This moves this deck to Trash. You can restore it later.'
      }
      open={pendingDeck !== null}
      title={pendingDeck ? `Delete "${pendingDeck.title}"?` : 'Delete deck?'}
      onConfirm={onConfirmDeck}
      onOpenChange={(open) => {
        if (!open) {
          onCloseDeck()
        }
      }}
    />
  </>
)
