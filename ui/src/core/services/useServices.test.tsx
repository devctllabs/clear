import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { useServices } from './useServices'

const MissingProviderProbe = () => {
  useServices()

  return null
}

describe('useServices', () => {
  it('throws when rendered without ServicesProvider', () => {
    expect(() => render(<MissingProviderProbe />)).toThrow('ServicesProvider is missing.')
  })
})
