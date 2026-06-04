export const newIdAllocator = (counters: Record<string, number>) => ({
  next(prefix: string) {
    const value = counters[prefix] ?? 1
    counters[prefix] = value + 1

    return `${prefix}-${value}`
  },
})
