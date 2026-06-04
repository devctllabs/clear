import type { Meta, StoryObj } from '@storybook/react-vite'
import type { ComponentProps } from 'react'
import { expect, within } from 'storybook/test'

import { domainError } from '@shared/errors'
import { noop } from '@/test/storybook/fixtures'
import { StorybookRouterProvider } from '@/test/storybook/router'

import { InlineErrorState, LoadErrorState } from './LoadErrorState'

type ErrorKind = 'Not found' | 'Retryable' | 'Unexpected'
type LoadErrorStateStoryArgs = Omit<ComponentProps<typeof LoadErrorState>, 'children' | 'error'> & {
  childrenText?: string
  errorKind: ErrorKind
}

const errorByKind = {
  'Not found': domainError.notFound('Deck not found.'),
  Retryable: domainError.unavailable('The service is temporarily unavailable.'),
  Unexpected: domainError.unexpected('The deck could not be opened.'),
} satisfies Record<ErrorKind, unknown>

const LoadErrorStateControls = ({
  childrenText,
  errorKind,
  ...args
}: LoadErrorStateStoryArgs) => (
  <LoadErrorState
    {...args}
    error={errorByKind[errorKind]}
  >
    {childrenText || undefined}
  </LoadErrorState>
)

const meta = {
  argTypes: {
    backLabel: {
      control: 'text',
    },
    backTo: {
      control: 'text',
    },
    childrenText: {
      control: 'text',
      name: 'children',
    },
    errorKind: {
      control: 'select',
      options: ['Retryable', 'Not found', 'Unexpected'],
    },
    onRetry: {
      table: {
        disable: true,
      },
    },
    retryLabel: {
      control: 'text',
    },
    showRetry: {
      control: 'boolean',
    },
    title: {
      control: 'text',
    },
    variant: {
      control: 'select',
      options: ['section', 'page', 'fullscreen'],
    },
  },
  args: {
    backLabel: 'Back',
    backTo: undefined,
    childrenText: '',
    errorKind: 'Retryable',
    retryLabel: 'Try again',
    showRetry: undefined,
    title: 'Deck could not be loaded',
    variant: 'section',
    onRetry: noop,
  },
  component: LoadErrorStateControls,
  decorators: [
    (Story) => (
      <StorybookRouterProvider>
        <Story />
      </StorybookRouterProvider>
    ),
  ],
  parameters: {
    layout: 'padded',
  },
  title: 'Shared/Feedback/ErrorStates',
} satisfies Meta<typeof LoadErrorStateControls>

export default meta

type Story = StoryObj<typeof meta>

const actionError = domainError.unavailable('Your changes could not be saved.')

export const Section: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const retryButton = await canvas.findByRole('button', { name: 'Try again' })

    await expect(retryButton).toHaveClass('min-w-36')
    await expect(retryButton).not.toHaveClass('w-full')
  },
}

export const SectionWithBack: Story = {
  args: {
    backLabel: 'Back to deck',
    backTo: '/',
  },
}

export const Page: Story = {
  args: {
    variant: 'page',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const retryButton = await canvas.findByRole('button', { name: 'Try again' })

    await expect(retryButton).toHaveClass('w-full')
  },
}

export const Fullscreen: Story = {
  args: {
    variant: 'fullscreen',
  },
  parameters: {
    layout: 'fullscreen',
  },
}

export const Inline: Story = {
  parameters: {
    controls: {
      disable: true,
    },
  },
  render: () => (
    <div className="max-w-md">
      <InlineErrorState error={actionError} title="Could not save deck" />
    </div>
  ),
}
