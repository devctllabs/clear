import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { useServices } from './useServices'
import { ServicesProvider } from './ServicesProvider'
import { createAppServices } from './service-registry'

const ServicesProbe = () => {
  const services = useServices()

  return (
    <span>
      {String(
        Boolean(
          services.bootstrap &&
            services.contentSearch &&
            services.decks &&
            services.folders &&
            services.notes &&
            services.review &&
            services.settings &&
            services.trash &&
            services.workspaces,
        ),
      )}
    </span>
  )
}

describe('ServicesProvider', () => {
  it('uses injected services when provided', () => {
    render(
      <ServicesProvider services={createAppServices('web')}>
        <ServicesProbe />
      </ServicesProvider>,
    )

    expect(screen.getByText('true')).toBeInTheDocument()
  })

  it('creates default services when no services are provided', () => {
    render(
      <ServicesProvider>
        <ServicesProbe />
      </ServicesProvider>,
    )

    expect(screen.getByText('true')).toBeInTheDocument()
  })
})
