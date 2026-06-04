import type { Meta, StoryObj } from '@storybook/react-vite'
import { Ellipsis, FileText } from 'lucide-react'

import { componentCanvas } from '@/test/storybook/decorators'
import { noop } from '@/test/storybook/fixtures'
import { IconButton } from '@shared/components/ui/icon-button'

import {
  InventoryList,
  InventoryRowShell,
  inventoryRowOverlayClassName,
} from './InventoryList'

type DemoItem = {
  id: string
  meta: string
  title: string
}

type DemoInventoryListProps = {
  items: DemoItem[]
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

const DemoInventoryList = ({ items }: DemoInventoryListProps) => (
  <InventoryList
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
  />
)

const meta = {
  args: {
    items: demoItems,
  },
  component: DemoInventoryList,
  decorators: [componentCanvas],
  parameters: {
    layout: 'fullscreen',
  },
  title: 'Shared/Data/InventoryList',
} satisfies Meta<typeof DemoInventoryList>

export default meta

type Story = StoryObj<typeof meta>

export const ManyItems: Story = {}

export const SingleItem: Story = {
  args: {
    items: [demoItems[0]],
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

export const Empty: Story = {
  args: {
    items: [],
  },
}
