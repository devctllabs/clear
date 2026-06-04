import * as React from 'react'
import * as SliderPrimitive from '@radix-ui/react-slider'

import { cn } from '@/shared/lib/utils'

import { getFocusRingClassName, type FocusSurface } from './focus'

type SliderProps = React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> & {
  focusSurface?: FocusSurface
  thumbProps?: React.ComponentPropsWithoutRef<typeof SliderPrimitive.Thumb>
}

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  SliderProps
>(({ className, focusSurface = 'background', thumbProps, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn('relative flex w-full touch-none select-none items-center', className)}
    {...props}
  >
    <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary">
      <SliderPrimitive.Range className="absolute h-full bg-primary" />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb
      {...thumbProps}
      className={cn(
        'block h-5 w-5 rounded-full border-2 border-primary bg-background transition-colors disabled:pointer-events-none disabled:opacity-50',
        getFocusRingClassName(focusSurface),
        thumbProps?.className,
      )}
    />
  </SliderPrimitive.Root>
))
Slider.displayName = SliderPrimitive.Root.displayName

export { Slider }
