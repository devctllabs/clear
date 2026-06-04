import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { useActiveWorkspaceId } from '@features/workspaces/hooks/useWorkspaces'
import { LoadErrorState } from '@shared/components/feedback/LoadErrorState'

const DashboardRoute = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const activeWorkspaceIdQuery = useActiveWorkspaceId()

  useEffect(() => {
    if (!activeWorkspaceIdQuery.data) {
      return
    }

    void navigate({
      params: { workspaceId: activeWorkspaceIdQuery.data },
      replace: true,
      to: '/dashboard/$workspaceId',
    })
  }, [activeWorkspaceIdQuery.data, navigate])

  if (activeWorkspaceIdQuery.isError) {
    return (
      <LoadErrorState
        backLabel={t(($) => $.navigation.actions.openWorkspaces)}
        backTo="/workspaces"
        error={activeWorkspaceIdQuery.error}
        title={t(($) => $.dashboard.errors.dashboardCouldNotOpen)}
        variant="fullscreen"
        onRetry={() => {
          void activeWorkspaceIdQuery.refetch()
        }}
      />
    )
  }

  return null
}

export const Route = createFileRoute('/dashboard/')({
  component: DashboardRoute,
})
