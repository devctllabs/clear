const integerFormatter = new Intl.NumberFormat(undefined, {
  maximumFractionDigits: 0,
})

export const normalizeFiniteNumber = (value: number, fallback = 0) =>
  Number.isFinite(value) ? value : fallback

export const normalizeNonNegativeInteger = (value: number, fallback = 0) =>
  Math.max(0, Math.round(normalizeFiniteNumber(value, fallback)))

export const normalizePercentage = (value: number, fallback = 0) =>
  Math.min(100, normalizeNonNegativeInteger(value, fallback))

export const formatInteger = (value: number) =>
  integerFormatter.format(normalizeFiniteNumber(value))

export const formatNonNegativeInteger = (value: number) =>
  integerFormatter.format(normalizeNonNegativeInteger(value))

export const formatPercentage = (value: number) => `${normalizePercentage(value)}%`
