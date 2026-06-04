export const breakpoints = {
  lg: 1024,
} as const

export const mediaQueries = {
  desktop: `(min-width: ${breakpoints.lg}px)`,
} as const

