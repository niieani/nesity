export const FIRST_QUARTILE = 0.25
export const THIRD_QUARTILE = 0.75

export const mean = (values: number[]): number =>
  values.reduce((a, b) => a + b, 0) / values.length

export const variance = (values: number[]): number => {
  const m = mean(values)
  return values.reduce((a, b) => a + (b - m) ** 2, 0) / values.length
}

export const stdev = (sortedPoints: number[]): number =>
  Math.sqrt(variance(sortedPoints))

export const distances = (sortedData: number[]): number[] =>
  Array.from({ length: sortedData.length - 1 }, (_, i) =>
    Math.abs(sortedData[i + 1]! - sortedData[i]!),
  )

export const sort = (data: number[]): number[] =>
  [...data].sort((a, b) => a - b)

export const quantile = (values: number[], q: number): number => {
  const sorted = [...values].sort((a, b) => a - b)
  const pos = (sorted.length - 1) * q
  const base = Math.floor(pos)
  const rest = pos - base
  const thisValue = sorted[base] ?? 0
  const nextValue = sorted[base + 1]
  if (nextValue !== undefined) {
    return thisValue + rest * (nextValue - thisValue)
  }
  return thisValue
}

export function interQuartileRange(x: number[]): number {
  const q1 = quantile(x, FIRST_QUARTILE)
  const q3 = quantile(x, THIRD_QUARTILE)
  return q3 - q1
}
