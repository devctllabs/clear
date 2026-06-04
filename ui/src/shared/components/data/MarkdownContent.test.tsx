import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { MarkdownContent } from './MarkdownContent'

describe('MarkdownContent', () => {
  it('renders rich markdown without forcing plain text into a heading', () => {
    render(
      <MarkdownContent
        markdown={
          'Plain prompt with **strong**, *emphasis*, and `code`.\n\n' +
          '- Hippocampus\n' +
          '- [x] Consolidated\n\n' +
          '[Study link](https://example.com)'
        }
      />,
    )

    expect(screen.getByText(/Plain prompt/)).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: /Plain prompt/ })).not.toBeInTheDocument()
    expect(screen.getByText(/Plain prompt/).closest('p')).toHaveClass('text-wrap-anywhere')
    expect(screen.getByText(/Plain prompt/).closest('.type-reading')).toHaveClass(
      'type-reading',
    )
    expect(screen.getByText('strong').closest('strong')).toBeInTheDocument()
    expect(screen.getByText('emphasis').closest('em')).toBeInTheDocument()
    expect(screen.getByText('code').tagName).toBe('CODE')
    expect(screen.getByRole('list')).toBeInTheDocument()
    expect(screen.getByText('Hippocampus').closest('li')).toBeInTheDocument()
    expect(screen.getByRole('checkbox')).toBeChecked()
    expect(screen.getByRole('checkbox')).toBeDisabled()
    expect(screen.getByRole('link', { name: 'Study link' })).toHaveAttribute(
      'href',
      'https://example.com',
    )
  })

  it('keeps reading typography semantics for markdown headings', () => {
    render(<MarkdownContent markdown={'## Durable Recall\n\nReview long-form study text.'} />)

    expect(screen.getByRole('heading', { name: 'Durable Recall' })).toHaveClass(
      'type-reading-heading',
      'type-reading-heading-md',
    )
  })

  it('skips raw HTML content', () => {
    render(<MarkdownContent markdown={'Visible <span>Injected</span> text'} />)

    expect(screen.getByText(/Visible/)).toBeInTheDocument()
    expect(screen.queryByText('Injected')).not.toBeInTheDocument()
    expect(document.querySelector('span')).not.toBeInTheDocument()
  })

  it('renders markdown images with stable lazy-loading dimensions', () => {
    render(<MarkdownContent markdown="![Diagram](https://example.com/diagram.png)" />)

    const image = screen.getByRole('img', { name: 'Diagram' })

    expect(image).toHaveAttribute('decoding', 'async')
    expect(image).toHaveAttribute('height', '360')
    expect(image).toHaveAttribute('loading', 'lazy')
    expect(image).toHaveAttribute('width', '640')
  })

  it('renders blockquotes as neutral full-border surfaces', () => {
    render(<MarkdownContent markdown="> Durable recall depends on specific prompts." />)

    const blockquote = screen
      .getByText('Durable recall depends on specific prompts.')
      .closest('blockquote')

    expect(blockquote).toHaveClass(
      'rounded-compact',
      'border',
      'border-border',
      'bg-muted/50',
    )
    expect(blockquote).not.toHaveClass(['border-l', '4'].join('-'))
    expect(blockquote).not.toHaveClass('italic')
  })

  it('hides active review cloze content without hiding inactive clozes', () => {
    render(
      <MarkdownContent
        activeClozeId="c1"
        clozeMode="review"
        markdown="The {{c1::**hippocampus**}} connects to {{c2::*cortex*}}."
      />,
    )

    expect(screen.getByText('•••')).toBeInTheDocument()
    expect(screen.queryByText('hippocampus')).not.toBeInTheDocument()
    expect(screen.getByText('cortex').closest('em')).toBeInTheDocument()
  })

  it('reveals active review cloze content with markdown formatting', () => {
    render(
      <MarkdownContent
        activeClozeId="c1"
        clozeMode="review"
        markdown="The {{c1::**hippocampus**}} connects to {{c2::*cortex*}}."
        revealed
      />,
    )

    expect(screen.getByText('hippocampus').closest('strong')).toBeInTheDocument()
    expect(
      screen.getByText('hippocampus').closest('[data-cloze-state="revealed"]'),
    ).toBeInTheDocument()
    expect(screen.getByText('cortex').closest('em')).toBeInTheDocument()
  })

  it('reveals all clozes in detail mode', () => {
    render(
      <MarkdownContent
        clozeMode="all"
        markdown="The {{c1::**hippocampus**}} connects to {{c2::*cortex*}}."
      />,
    )

    expect(screen.getByText('hippocampus').closest('strong')).toBeInTheDocument()
    expect(screen.getByText('cortex').closest('em')).toBeInTheDocument()
    expect(document.querySelectorAll('[data-cloze-state="revealed"]')).toHaveLength(2)
  })

  it('keeps malformed cloze markers literal', () => {
    render(<MarkdownContent clozeMode="review" markdown="Broken {{c1::hippocampus marker" />)

    expect(screen.getByText(/Broken/)).toHaveTextContent('Broken {{c1::hippocampus marker')
    expect(screen.queryByText('•••')).not.toBeInTheDocument()
  })
})
