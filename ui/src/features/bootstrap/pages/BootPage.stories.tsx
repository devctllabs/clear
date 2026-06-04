import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, within } from 'storybook/test'

import {
  expectNoHorizontalOverflow,
  setMobileRegressionViewport,
} from '@/test/storybook/assertions'
import {
  createBootstrapService,
  createStorybookServices,
  unavailableError,
} from '@/test/storybook/page-services'
import { withStorybookApp } from '@/test/storybook/providers'

import { BootPage } from './BootPage'

const withBootPage = ({
  error,
  loading = false,
}: {
  error?: ReturnType<typeof unavailableError>
  loading?: boolean
} = {}) =>
  withStorybookApp({
    initialEntry: '/boot',
    services: () =>
      createStorybookServices({
        bootstrap: createBootstrapService({ error, loading }),
      }),
  })

const meta = {
  component: BootPage,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['!autodocs'],
  title: 'Features/Bootstrap/Pages/BootPage',
} satisfies Meta<typeof BootPage>

export default meta

type Story = StoryObj<typeof meta>

const expectStableBootStage = async (canvasElement: HTMLElement) => {
  const main = canvasElement.querySelector('#main-content')
  const stage = main?.firstElementChild

  await expect(stage).toHaveClass('h-[16rem]')
}

export const Loading: Story = {
  decorators: [withBootPage({ loading: true })],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    const status = await canvas.findByRole('status')

    await canvas.findByText('Clear')
    await canvas.findByRole('heading', { name: 'Preparing your study space' })
    await expect(status).toHaveAttribute('aria-busy', 'true')
    await expectStableBootStage(canvasElement)
    await expect(canvas.queryByText('Opening the local workspace.')).not.toBeInTheDocument()
    await expectNoHorizontalOverflow(canvasElement)
  },
}

export const LoadError: Story = {
  decorators: [
    withBootPage({
      error: unavailableError('Desktop runtime unavailable.'),
    }),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    const alert = await canvas.findByRole('alert')

    await canvas.findByText('Clear')
    await canvas.findByRole('heading', { name: 'Could not start' })
    await expect(
      canvas.queryByRole('heading', { name: 'Clear could not start' }),
    ).not.toBeInTheDocument()
    await canvas.findByText('The service is temporarily unavailable.')
    await canvas.findByRole('button', { name: 'Try again' })
    await expect(alert.querySelector('.shadow-card')).not.toBeInTheDocument()
    await expectStableBootStage(canvasElement)
    await expectNoHorizontalOverflow(canvasElement)
  },
}

export const MobileLoadingRegression: Story = {
  decorators: [withBootPage({ loading: true })],
  globals: {
    appFormFactor: 'mobile',
  },
  tags: ['!dev', '!autodocs', 'layout-regression'],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await setMobileRegressionViewport()
    const status = await canvas.findByRole('status')

    await canvas.findByText('Clear')
    await canvas.findByRole('heading', { name: 'Preparing your study space' })
    await expect(status).toHaveAttribute('aria-busy', 'true')
    await expectStableBootStage(canvasElement)
    await expect(canvas.queryByText('Opening the local workspace.')).not.toBeInTheDocument()
    await expectNoHorizontalOverflow(canvasElement)
  },
}

export const MobileLoadErrorRegression: Story = {
  decorators: [
    withBootPage({
      error: unavailableError('Desktop runtime unavailable.'),
    }),
  ],
  globals: {
    appFormFactor: 'mobile',
  },
  tags: ['!dev', '!autodocs', 'layout-regression'],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await setMobileRegressionViewport()
    const alert = await canvas.findByRole('alert')

    await canvas.findByText('Clear')
    await canvas.findByRole('heading', { name: 'Could not start' })
    await expect(
      canvas.queryByRole('heading', { name: 'Clear could not start' }),
    ).not.toBeInTheDocument()
    await canvas.findByText('The service is temporarily unavailable.')
    await canvas.findByRole('button', { name: 'Try again' })
    await expect(alert.querySelector('.shadow-card')).not.toBeInTheDocument()
    await expectStableBootStage(canvasElement)
    await expectNoHorizontalOverflow(canvasElement)
  },
}
