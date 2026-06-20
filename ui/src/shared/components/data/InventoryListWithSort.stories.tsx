import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { Ellipsis, FileText } from 'lucide-react'
import { expect, waitFor, within } from 'storybook/test'

import { componentCanvas } from '@/test/storybook/decorators'
import { noop } from '@/test/storybook/fixtures'
import { IconButton } from '@shared/components/ui/icon-button'
import type { SortPreference } from '@shared/types/sort.types'

import {
  InventoryRowShell,
  inventoryRowOverlayClassName,
} from './InventoryList'
import { InventoryListWithSort } from './InventoryListWithSort'

type DemoItem = {
  id: string
  meta: string
  title: string
}

type DemoSortField = 'title' | 'updatedAt'

type DemoInventoryListWithSortProps = {
  items: DemoItem[]
  showSort?: boolean
}

const demoItems: DemoItem[] = [
  {
    id: 'reading-notes',
    meta: 'Updated 1h ago',
    title: 'Academic',
  },
  {
    id: 'reference',
    meta: 'Updated 3h ago',
    title: 'Professional',
  },
  {
    id: 'language-lab',
    meta: 'Updated 2d ago',
    title: 'Language Lab',
  },
]

const DemoInventoryListWithSort = ({
  items,
  showSort = true,
}: DemoInventoryListWithSortProps) => {
  const [sort, setSort] = useState<SortPreference<DemoSortField>>({
    direction: 'desc',
    field: 'updatedAt',
  })

  return (
    <InventoryListWithSort
      getItemKey={(item) => item.id}
      items={items}
      renderItem={(item) => (
        <InventoryRowShell>
          <a
            aria-label={`Open ${item.title}`}
            className={inventoryRowOverlayClassName}
            href={`#${item.id}`}
          />
          <span className="pointer-events-none relative z-20 inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-foreground">
            <FileText className="size-5" />
          </span>
          <span className="pointer-events-none relative z-20 min-w-0">
            <span className="line-clamp-2 text-wrap-anywhere type-row-title">
              {item.title}
            </span>
            <span className="mt-1 block text-wrap-anywhere text-xs font-medium text-muted-foreground">
              {item.meta}
            </span>
          </span>
          <span className="pointer-events-auto relative z-20 flex shrink-0 items-center justify-self-end">
            <IconButton
              focusSurface="card"
              icon={<Ellipsis className="size-4" />}
              label={`${item.title} actions`}
              size="sm"
              onClick={noop}
            />
          </span>
        </InventoryRowShell>
      )}
      showSort={showSort}
      sort={sort}
      sortAriaLabel="Sort items"
      sortFieldOptions={[
        { field: 'title', label: 'Title' },
        { field: 'updatedAt', label: 'Updated' },
      ]}
      title="Items"
      onSortChange={setSort}
    />
  )
}

const OffsetRegressionInventorySections = () => {
  const [sort, setSort] = useState<SortPreference<DemoSortField>>({
    direction: 'desc',
    field: 'updatedAt',
  })

  return (
    <div className="grid w-full min-w-0 gap-8">
      <InventoryListWithSort
        getItemKey={(item) => item.id}
        items={demoItems}
        renderItem={(item) => (
          <InventoryRowShell>
            <a
              aria-label={`Open ${item.title}`}
              className={inventoryRowOverlayClassName}
              href={`#many-${item.id}`}
            />
            <span className="pointer-events-none relative z-20 min-w-0">
              <span className="line-clamp-2 text-wrap-anywhere type-row-title">
                {item.title}
              </span>
              <span className="mt-1 block text-wrap-anywhere text-xs font-medium text-muted-foreground">
                {item.meta}
              </span>
            </span>
            <span className="pointer-events-auto relative z-20 flex shrink-0 items-center justify-self-end">
              <IconButton
                focusSurface="card"
                icon={<Ellipsis className="size-4" />}
                label={`${item.title} actions`}
                size="sm"
                onClick={noop}
              />
            </span>
          </InventoryRowShell>
        )}
        sort={sort}
        sortAriaLabel="Sort many items"
        sortFieldOptions={[
          { field: 'title', label: 'Title' },
          { field: 'updatedAt', label: 'Updated' },
        ]}
        title="Many Items"
        onSortChange={setSort}
      />
      <InventoryListWithSort
        getItemKey={(item) => item.id}
        items={[demoItems[0]]}
        renderItem={(item) => (
          <InventoryRowShell>
            <a
              aria-label={`Open ${item.title}`}
              className={inventoryRowOverlayClassName}
              href={`#single-${item.id}`}
            />
            <span className="pointer-events-none relative z-20 min-w-0">
              <span className="line-clamp-2 text-wrap-anywhere type-row-title">
                {item.title}
              </span>
              <span className="mt-1 block text-wrap-anywhere text-xs font-medium text-muted-foreground">
                {item.meta}
              </span>
            </span>
            <span className="pointer-events-auto relative z-20 flex shrink-0 items-center justify-self-end">
              <IconButton
                focusSurface="card"
                icon={<Ellipsis className="size-4" />}
                label={`${item.title} actions`}
                size="sm"
                onClick={noop}
              />
            </span>
          </InventoryRowShell>
        )}
        showSort={false}
        sort={sort}
        sortAriaLabel="Sort single item"
        sortFieldOptions={[
          { field: 'title', label: 'Title' },
          { field: 'updatedAt', label: 'Updated' },
        ]}
        title="Single Item"
        onSortChange={setSort}
      />
    </div>
  )
}

const getHeadingToSurfaceOffset = (heading: HTMLElement) => {
  const section = heading.closest('section')
  const surface = section?.querySelector('.overflow-hidden')

  if (!(surface instanceof HTMLElement)) {
    throw new Error('Expected inventory section to render a list surface.')
  }

  return surface.getBoundingClientRect().top - heading.getBoundingClientRect().top
}

const meta = {
  args: {
    items: demoItems,
  },
  component: DemoInventoryListWithSort,
  decorators: [componentCanvas],
  parameters: {
    layout: 'fullscreen',
  },
  title: 'Shared/Data/InventoryListWithSort',
} satisfies Meta<typeof DemoInventoryListWithSort>

export default meta

type Story = StoryObj<typeof meta>

export const ManyItems: Story = {}

export const SingleItemSortHidden: Story = {
  args: {
    items: [demoItems[0]],
    showSort: false,
  },
}

export const HiddenSortOffsetRegression: Story = {
  render: () => <OffsetRegressionInventorySections />,
  tags: ['!dev', '!autodocs', 'layout-regression'],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const manyHeading = await canvas.findByRole('heading', { name: 'Many Items' })
    const singleHeading = await canvas.findByRole('heading', { name: 'Single Item' })

    await waitFor(() => {
      const manyOffset = getHeadingToSurfaceOffset(manyHeading)
      const singleOffset = getHeadingToSurfaceOffset(singleHeading)

      expect(Math.abs(manyOffset - singleOffset)).toBeLessThanOrEqual(1)
    })
  },
}

export const LongText: Story = {
  args: {
    items: [
      {
        id: 'long-title',
        meta: 'Updated 12h ago',
        title: 'Clinical Neuroanatomy Differential Diagnosis and Case Review Archive',
      },
      {
        id: 'unbroken-title',
        meta: 'Updated 4d ago',
        title: 'NeuroimmunoendocrinologicalPathophysiologyReferenceCompendium',
      },
    ],
  },
}
