import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'

const IndexRoute = () => {
  const navigate = useNavigate()

  useEffect(() => {
    void navigate({ replace: true, to: '/workspaces' })
  }, [navigate])

  return null
}

export const Route = createFileRoute('/')({
  component: IndexRoute,
})
