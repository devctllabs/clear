import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from '@tanstack/react-router'

import '@assets/styles/globals.css'
import { AppProviders } from '@core/providers/AppProviders'
import { router } from '@core/router/router'
import { initializeTheme } from '@core/theme'

initializeTheme()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>
  </StrictMode>,
)
