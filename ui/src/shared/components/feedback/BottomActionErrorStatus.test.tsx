import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { domainError } from '@shared/errors'

import {
  BottomActionErrorStatus,
  BottomStatus,
  BottomStatusStack,
} from './BottomActionErrorStatus'

describe('BottomActionErrorStatus', () => {
  it('dismisses the current error and shows a later error', async () => {
    const user = userEvent.setup()
    const firstError = domainError.unexpected('First write failed.')
    const secondError = domainError.unexpected('Second write failed.')
    const { rerender } = render(
      <BottomActionErrorStatus error={firstError} title="Could not save changes" />,
    )

    expect(screen.getByRole('status')).toHaveTextContent('First write failed.')

    await user.click(screen.getByRole('button', { name: 'Dismiss error' }))

    expect(screen.queryByRole('status')).not.toBeInTheDocument()

    rerender(
      <BottomActionErrorStatus error={secondError} title="Could not save changes" />,
    )

    expect(screen.getByRole('status')).toHaveTextContent('Second write failed.')
  })

  it('uses dismissKey to distinguish repeated occurrences of the same error', async () => {
    const user = userEvent.setup()
    const error = domainError.unexpected('Write failed.')
    const { rerender } = render(
      <BottomActionErrorStatus
        dismissKey={1}
        error={error}
        title="Could not save changes"
      />,
    )

    expect(screen.getByRole('status')).toHaveTextContent('Write failed.')

    await user.click(screen.getByRole('button', { name: 'Dismiss error' }))

    expect(screen.queryByRole('status')).not.toBeInTheDocument()

    rerender(
      <BottomActionErrorStatus
        dismissKey={1}
        error={error}
        title="Could not save changes"
      />,
    )

    expect(screen.queryByRole('status')).not.toBeInTheDocument()

    rerender(
      <BottomActionErrorStatus
        dismissKey={2}
        error={error}
        title="Could not save changes"
      />,
    )

    expect(screen.getByRole('status')).toHaveTextContent('Write failed.')
  })

  it('clears dismissal after the error prop is cleared', async () => {
    const user = userEvent.setup()
    const error = domainError.unexpected('Write failed.')
    const { rerender } = render(
      <BottomActionErrorStatus error={error} title="Could not save changes" />,
    )

    await user.click(screen.getByRole('button', { name: 'Dismiss error' }))

    expect(screen.queryByRole('status')).not.toBeInTheDocument()

    rerender(<BottomActionErrorStatus error={null} title="Could not save changes" />)
    rerender(<BottomActionErrorStatus error={error} title="Could not save changes" />)

    expect(screen.getByRole('status')).toHaveTextContent('Write failed.')
  })

  it('uses neutral status semantics by default', () => {
    render(
      <BottomActionErrorStatus
        error={domainError.unexpected('Write failed.')}
        title="Could not save changes"
      />,
    )

    expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite')
    expect(screen.getByText('Could not save changes')).toHaveClass('text-foreground')
    expect(screen.getByRole('status').closest('.fixed')).toHaveClass(
      'bottom-[calc(7rem+env(safe-area-inset-bottom)+var(--visual-viewport-bottom-offset,0px))]',
    )
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('renders action errors without alert semantics', () => {
    render(
      <BottomActionErrorStatus
        error={domainError.unavailable('Workspace switch failed.')}
        title="Could not switch workspace"
      />,
    )

    expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite')
    expect(screen.getByText('Could not switch workspace')).toHaveClass('text-foreground')
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('renders neutral stale-data status with a polite retry action', async () => {
    const user = userEvent.setup()
    const onAction = vi.fn()

    render(
      <BottomStatusStack>
        <BottomStatus
          actionLabel="Check again"
          error={domainError.unavailable('Refresh failed.')}
          title="Notes may be out of date"
          onAction={onAction}
        />
      </BottomStatusStack>,
    )

    const status = screen.getByRole('status')
    expect(status).toHaveTextContent('Notes may be out of date')
    expect(status).toHaveAttribute('aria-live', 'polite')
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Check again' }))

    expect(onAction).toHaveBeenCalledTimes(1)
  })
})
