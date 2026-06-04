import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { Button } from './button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from './card'
import { Slider } from './slider'

describe('shared ui primitives', () => {
  it('renders card slots with forwarded classes and content', () => {
    render(
      <Card className="outer" data-testid="card">
        <CardHeader data-testid="header">
          <CardTitle>Title</CardTitle>
          <CardDescription>Description</CardDescription>
        </CardHeader>
        <CardContent>Content</CardContent>
        <CardFooter>Footer</CardFooter>
      </Card>,
    )

    expect(screen.getByTestId('card')).toHaveClass('outer')
    expect(screen.getByText('Title')).toBeInTheDocument()
    expect(screen.getByText('Description')).toBeInTheDocument()
    expect(screen.getByText('Content')).toBeInTheDocument()
    expect(screen.getByText('Footer')).toBeInTheDocument()
  })

  it('renders an accessible slider thumb', () => {
    render(<Slider thumbProps={{ 'aria-label': 'Retention' }} value={[90]} />)

    expect(screen.getByRole('slider', { name: 'Retention' })).toHaveAttribute(
      'aria-valuenow',
      '90',
    )
  })

  it('resets button focus after pointer clicks without suppressing keyboard focus', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()

    render(<Button onClick={onClick}>Save</Button>)

    const button = screen.getByRole('button', { name: 'Save' })
    await user.click(button)
    expect(onClick).toHaveBeenCalledTimes(1)

    await waitFor(() => {
      expect(button).not.toHaveFocus()
    })

    button.focus()
    fireEvent.keyDown(button, { key: 'Enter' })
    fireEvent.click(button)

    expect(onClick).toHaveBeenCalledTimes(2)
    expect(button).toHaveFocus()
  })

  it('can preserve focus after pointer clicks when requested', async () => {
    const user = userEvent.setup()

    render(<Button preservePointerFocus>Open</Button>)

    const button = screen.getByRole('button', { name: 'Open' })
    await user.click(button)

    expect(button).toHaveFocus()
  })

  it('uses bare button rendering by default with shared focus behavior', () => {
    render(
      <Button className="custom-button">
        Plain
      </Button>,
    )

    const button = screen.getByRole('button', { name: 'Plain' })
    expect(button).toHaveClass('custom-button')
    expect(button).toHaveClass('focus-visible:ring-2')
    expect(button).not.toHaveClass('h-10')
    expect(button).not.toHaveClass('px-4')
  })

  it('can render surface-aware button focus rings', () => {
    render(
      <>
        <Button focusSurface="card">Card surface</Button>
        <Button focusSurface="muted">Muted surface</Button>
        <Button focusSurface="popover">Popover surface</Button>
      </>,
    )

    expect(screen.getByRole('button', { name: 'Card surface' })).toHaveClass(
      'card-focus-ring',
    )
    expect(screen.getByRole('button', { name: 'Card surface' })).not.toHaveClass(
      'focus-visible:ring-offset-background',
    )
    expect(screen.getByRole('button', { name: 'Muted surface' })).toHaveClass(
      'muted-focus-ring',
    )
    expect(screen.getByRole('button', { name: 'Popover surface' })).toHaveClass(
      'popover-focus-ring',
    )
  })

  it('uses styled button rendering when a variant is selected', () => {
    render(<Button variant="default">Styled</Button>)

    const button = screen.getByRole('button', { name: 'Styled' })
    expect(button).toHaveClass('bg-primary')
    expect(button).toHaveClass('h-10')
    expect(button).toHaveClass('px-4')
  })
})
