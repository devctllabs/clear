import type { Meta, StoryObj } from '@storybook/react-vite'

import { componentCanvas } from '@/test/storybook/decorators'
import { noop } from '@/test/storybook/fixtures'
import { Button } from '@shared/components/ui/button'

import { InventoryList, InventorySection } from './InventoryList'

const demoItems = ['First item', 'Second item'] as const

const DemoInventorySection = () => (
  <InventorySection
    actionSlot={
      <Button
        className="type-label h-auto rounded-full px-2 py-1 uppercase text-muted-foreground"
        type="button"
        onClick={noop}
      >
        Action
      </Button>
    }
    title="Items"
  >
    <InventoryList
      getItemKey={(item) => item}
      items={demoItems}
      renderItem={(item) => (
        <div className="px-5 py-4 type-row-title">
          {item}
        </div>
      )}
    />
  </InventorySection>
)

const meta = {
  component: DemoInventorySection,
  decorators: [componentCanvas],
  parameters: {
    layout: 'fullscreen',
  },
  title: 'Shared/Data/InventorySection',
} satisfies Meta<typeof DemoInventorySection>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}
