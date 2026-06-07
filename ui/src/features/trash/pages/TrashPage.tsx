import { useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import {
  BottomStatus,
  BottomStatusStack,
  desktopBottomStatusStackClassName,
} from '@shared/components/feedback/BottomActionErrorStatus'
import { ConfirmDialog } from '@shared/components/feedback/ConfirmDialog'
import { LoadErrorState } from '@shared/components/feedback/LoadErrorState'
import { BottomNav, type NavigationTarget } from '@shared/components/layout/BottomNav'
import {
  DesktopPageHeader,
  DesktopPageLayout,
} from '@shared/components/layout/DesktopShell'
import { AppShell, PageHeader, ScreenCanvas } from '@shared/components/layout/Screen'
import { useActiveWorkspaceId } from '@features/workspaces/hooks/useWorkspaces'
import { useDelayedBoolean } from '@shared/hooks/useDelayedBoolean'
import { useIsDesktopLayout } from '@shared/hooks/useAppLayoutMode'
import { useDateFormatters } from '@shared/lib/translated-date-format'

import { TrashLoadingState } from '../components/TrashLoadingState'
import { TrashHeaderAction } from '../components/TrashHeaderAction'
import { WorkspaceTrashEmptyState } from '../components/WorkspaceTrashEmptyState'
import { WorkspaceTrashList } from '../components/WorkspaceTrashList'
import { WorkspaceTrashSummary } from '../components/WorkspaceTrashSummary'
import {
  useDeleteTrashItem,
  useRestoreTrashItem,
  useTrash,
} from '../hooks/useTrash'
import type { TrashItem } from '../types/trash.types'

export const TrashPage = () => {
  const { t } = useTranslation()
  const { formatRelativeAge } = useDateFormatters()
  const activeWorkspaceIdQuery = useActiveWorkspaceId()
  const homeTarget = activeWorkspaceIdQuery.data
    ? { to: `/dashboard/${activeWorkspaceIdQuery.data}` }
    : { to: '/workspaces' }
  const isDesktop = useIsDesktopLayout()
  const trashQuery = useTrash()
  const restoreItem = useRestoreTrashItem()
  const deleteItem = useDeleteTrashItem()
  const [pendingDeleteItem, setPendingDeleteItem] = useState<TrashItem | null>(null)
  const [pendingRestoreItemId, setPendingRestoreItemId] = useState<string | null>(null)
  const showInitialLoading = useDelayedBoolean(trashQuery.isLoading, 180)
  const showRestorePending = useDelayedBoolean(restoreItem.isPending, 250)
  const openDeleteItemDialog = (item: TrashItem) => {
    deleteItem.reset()
    setPendingDeleteItem(item)
  }
  const closeDeleteItemDialog = () => {
    setPendingDeleteItem(null)
    deleteItem.reset()
  }

  if (showInitialLoading) {
    return (
      <TrashPageShell
        homeTarget={homeTarget}
        isDesktop={isDesktop}
        rightSlot={<TrashHeaderAction />}
      >
        <TrashLoadingState />
      </TrashPageShell>
    )
  }

  if (trashQuery.isLoading) {
    return (
      <TrashPageShell
        homeTarget={homeTarget}
        isDesktop={isDesktop}
        rightSlot={<TrashHeaderAction />}
      />
    )
  }

  if (trashQuery.isError && trashQuery.data === undefined) {
    return (
      <TrashPageShell
        homeTarget={homeTarget}
        isDesktop={isDesktop}
        rightSlot={<TrashHeaderAction />}
      >
        <LoadErrorState
          error={trashQuery.error}
          title={t(($) => $.trash.errors.trashCouldNotLoad)}
          onRetry={() => {
            void trashQuery.refetch()
          }}
        />
      </TrashPageShell>
    )
  }

  const trashState = trashQuery.data ?? {
    items: [],
    lastEmptiedAt: new Date().toISOString(),
  }
  const itemCount = trashState.items.length
  const summaryLabel = t(($) => $.trash.labels.itemCount, { count: itemCount })
  const summaryAge = t(($) => $.trash.labels.lastEmptied, {
    value: formatRelativeAge(trashState.lastEmptiedAt),
  })
  const hasTrashRefreshError = trashQuery.isError && trashQuery.data !== undefined
  const hasBottomStatus = hasTrashRefreshError || restoreItem.isError
  const screenBottomPadding = hasTrashRefreshError && restoreItem.isError
    ? 'pb-[calc(16rem+env(safe-area-inset-bottom)+var(--visual-viewport-bottom-offset,0px))]'
    : hasBottomStatus
      ? 'pb-[calc(13rem+env(safe-area-inset-bottom)+var(--visual-viewport-bottom-offset,0px))]'
      : undefined

  return (
    <>
      <TrashPageShell
        homeTarget={homeTarget}
        isDesktop={isDesktop}
        rightSlot={<TrashHeaderAction />}
        screenClassName={screenBottomPadding}
      >
        <WorkspaceTrashSummary ageLabel={summaryAge} countLabel={summaryLabel} />
        <div className="mt-6">
          {itemCount > 0 ? (
            <WorkspaceTrashList
              items={trashState.items}
              onDeleteRequest={(item) => {
                openDeleteItemDialog(item)
              }}
              onRestore={(itemId) => {
                if (restoreItem.isPending) {
                  return
                }

                setPendingRestoreItemId(itemId)
                restoreItem.mutate(itemId, {
                  onSettled: () => {
                    setPendingRestoreItemId(null)
                  },
                })
              }}
              restoringItemId={pendingRestoreItemId}
              showRestoringSpinner={showRestorePending}
            />
          ) : (
            <WorkspaceTrashEmptyState />
          )}
        </div>
      </TrashPageShell>
      <ConfirmDialog
        actionError={
          deleteItem.isError
            ? { error: deleteItem.error, title: t(($) => $.trash.errors.couldNotDeleteItem) }
            : null
        }
        confirmLabel={t(($) => $.trash.actions.deletePermanently)}
        confirming={deleteItem.isPending}
        description={
          pendingDeleteItem
            ? t(($) => $.trash.dialogs.deleteItemDescription, {
                title: pendingDeleteItem.title,
              })
            : t(($) => $.trash.dialogs.deleteItemFallbackDescription)
        }
        open={pendingDeleteItem !== null}
        title={
          pendingDeleteItem
            ? t(($) => $.trash.dialogs.deleteItemTitle, {
                title: pendingDeleteItem.title,
              })
            : t(($) => $.trash.dialogs.deleteItemFallbackTitle)
        }
        onConfirm={() => {
          if (!pendingDeleteItem) {
            return
          }

          deleteItem.mutate(pendingDeleteItem.id, {
            onSuccess: () => {
              setPendingDeleteItem(null)
            },
          })
        }}
        onOpenChange={(open) => {
          if (!open) {
            closeDeleteItemDialog()
          }
        }}
      />
      {hasBottomStatus ? (
        <BottomStatusStack className={isDesktop ? desktopBottomStatusStackClassName : undefined}>
          {hasTrashRefreshError ? (
            <BottomStatus
              actionLabel={t(($) => $.common.actions.checkAgain)}
              dismissKey={trashQuery.errorUpdateCount}
              error={trashQuery.error}
              title={t(($) => $.trash.errors.trashMayBeOutOfDate)}
              onAction={() => {
                void trashQuery.refetch()
              }}
            />
          ) : null}
          {restoreItem.isError ? (
            <BottomStatus
              dismissLabel={t(($) => $.common.actions.dismissError)}
              error={restoreItem.error}
              title={t(($) => $.trash.errors.couldNotRestoreItem)}
            />
          ) : null}
        </BottomStatusStack>
      ) : null}
    </>
  )
}

const TrashPageShell = ({
  children,
  homeTarget,
  isDesktop,
  rightSlot,
  screenClassName,
}: {
  children?: ReactNode
  homeTarget: NavigationTarget
  isDesktop: boolean
  rightSlot?: ReactNode
  screenClassName?: string
}) => {
  const { t } = useTranslation()

  if (isDesktop) {
    return (
      <DesktopPageLayout
        activeItem="trash"
        contentClassName="mx-auto w-full max-w-page-narrow"
        homeTarget={homeTarget}
      >
        <DesktopPageHeader rightSlot={rightSlot} title={t(($) => $.trash.labels.title)} />
        {children}
      </DesktopPageLayout>
    )
  }

  return (
    <AppShell>
      <ScreenCanvas className={screenClassName}>
        <PageHeader
          backTo="/menu"
          className="mb-7"
          reserveDescriptionSpace={false}
          rightSlot={rightSlot}
          title={t(($) => $.trash.labels.title)}
        />
        {children}
      </ScreenCanvas>
      <BottomNav activeItem="menu" homeTarget={homeTarget} />
    </AppShell>
  )
}
