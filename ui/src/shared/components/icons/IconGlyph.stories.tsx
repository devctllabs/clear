import type { Meta, StoryObj } from '@storybook/react-vite'

import { componentCanvas } from '@/test/storybook/decorators'

import { IconGlyph, IconGlyphLoadingFallback, LazyIconGlyph } from './IconGlyph'

const iconPreviewClassName =
  'flex size-14 items-center justify-center rounded-full border border-border bg-muted text-muted-foreground'

const meta = {
  args: {
    name: 'sparkles',
  },
  component: IconGlyph,
  decorators: [componentCanvas],
  parameters: {
    layout: 'fullscreen',
  },
  title: 'Shared/Icons/IconGlyph',
} satisfies Meta<typeof IconGlyph>

export default meta

type Story = StoryObj<typeof meta>

export const Loaded: Story = {
  render: () => (
    <div className="flex w-full items-center justify-center gap-3">
      <div aria-label="Sparkles icon" className={iconPreviewClassName} role="img">
        <IconGlyph name="sparkles" />
      </div>
      <div aria-label="Book icon" className={iconPreviewClassName} role="img">
        <LazyIconGlyph name="book-open" />
      </div>
      <div aria-label="Fallback icon" className={iconPreviewClassName} role="img">
        <IconGlyph name="not-a-lucide-icon" />
      </div>
    </div>
  ),
}

export const LoadingFallback: Story = {
  render: () => (
    <div
      aria-label="Loading icon"
      className={`${iconPreviewClassName} mx-auto`}
      role="img"
    >
      <IconGlyphLoadingFallback />
    </div>
  ),
}
