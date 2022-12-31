export const FIRST_QUARTILE = 0.25
export const THIRD_QUARTILE = 0.75

export type DataOrSortedData =
  | {
      sortedData: number[]
      data?: number[]
    }
  | { data: number[]; sortedData?: number[] }

export const sort = (data: number[]): number[] =>
  [...data].sort((a, b) => a - b)

export const mean = (data: number[]): number =>
  data.reduce((a, b) => a + b, 0) / data.length

export const variance = ({
  data,
  sortedData = sort(data!),
  mean: m = mean(sortedData),
}: DataOrSortedData & {
  mean?: number
}): number =>
  sortedData.reduce((a, b) => a + (b - m) ** 2, 0) / sortedData.length

export const stdev = ({
  data,
  sortedData = sort(data!),
  variance: v = variance({ sortedData }),
}: DataOrSortedData & { variance?: number }): number => Math.sqrt(v)

export const distances = ({
  data,
  sortedData = sort(data!),
}: DataOrSortedData): number[] =>
  Array.from({ length: sortedData.length - 1 }, (_, i) =>
    Math.abs(sortedData[i + 1]! - sortedData[i]!),
  )

export const quantile = ({
  data,
  sortedData = sort(data!),
  q,
}: DataOrSortedData & {
  q: number
}): number => {
  const pos = (sortedData.length - 1) * q
  const base = Math.floor(pos)
  const rest = pos - base
  const thisValue = sortedData[base] ?? 0
  const nextValue = sortedData[base + 1]
  if (nextValue !== undefined) {
    return thisValue + rest * (nextValue - thisValue)
  }
  return thisValue
}

export function interQuartileRange({
  data,
  sortedData = sort(data!),
}: DataOrSortedData): number {
  const q1 = quantile({ sortedData, q: FIRST_QUARTILE })
  const q3 = quantile({ sortedData, q: THIRD_QUARTILE })
  return q3 - q1
}

export const getStableRandom = (seed: number = 1) =>
  function stableRandom() {
    // eslint-disable-next-line no-param-reassign
    if (seed === 0) seed++
    // eslint-disable-next-line no-param-reassign
    const x = Math.sin(seed++) * 10_000
    return x - Math.floor(x)
  }
