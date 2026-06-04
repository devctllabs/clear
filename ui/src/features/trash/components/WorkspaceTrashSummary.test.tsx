import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { WorkspaceTrashSummary } from './WorkspaceTrashSummary'

describe('WorkspaceTrashSummary', () => {
  it('renders trash count and last emptied age', () => {
    render(<WorkspaceTrashSummary ageLabel="Last emptied 2 days ago" countLabel="3 items" />)

    expect(screen.getByText('3 items')).toBeInTheDocument()
    expect(screen.getByText('Last emptied 2 days ago')).toBeInTheDocument()
  })
})
