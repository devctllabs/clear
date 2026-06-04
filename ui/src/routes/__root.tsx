import { Outlet, createRootRoute } from '@tanstack/react-router'

import { ReloadShortcut, ReloadTransition } from '@core/reload'
import { useFocusModalityTracking } from '@shared/hooks/useFocusModalityTracking'

const RootLayout = () => {
  useFocusModalityTracking()

  return (
    <>
      <a
        className="sr-only fixed left-4 top-4 z-[100] rounded-full bg-background px-4 py-2 text-sm font-bold text-foreground shadow-floating focus:not-sr-only focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
        href="#main-content"
      >
        Skip to content
      </a>
      <ReloadShortcut />
      <ReloadTransition />
      <Outlet />
    </>
  )
}

export const Route = createRootRoute({
  component: RootLayout,
})
