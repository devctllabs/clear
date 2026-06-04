import type { Decorator } from '@storybook/react-vite'

export const componentCanvas: Decorator = (Story) => (
  <div className="flex min-h-screen w-full items-center justify-center px-6 py-12">
    <div className="w-full max-w-md">
      <Story />
    </div>
  </div>
)

export const appScreenCanvas: Decorator = (Story) => (
  <div className="min-h-screen w-full bg-background">
    <div className="mx-auto min-h-screen w-full max-w-md bg-background">
      <Story />
    </div>
  </div>
)

export const formCanvas: Decorator = (Story) => (
  <div className="flex min-h-screen w-full justify-center px-6 py-12">
    <div className="w-full max-w-md">
      <Story />
    </div>
  </div>
)

export const paddedCanvas: Decorator = (Story) => (
  <div className="min-h-screen w-full p-8">
    <Story />
  </div>
)
