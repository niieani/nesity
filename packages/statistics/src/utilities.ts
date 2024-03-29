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
  data.length === 0 ? 0 : data.reduce((a, b) => a + b, 0) / data.length

export const variance = ({
  data,
  sortedData = sort(data!),
  mean: m = mean(sortedData),
  besselsCorrection = false,
}: DataOrSortedData & {
  mean?: number
  besselsCorrection?: boolean
}): number =>
  sortedData.length > 1
    ? sortedData.reduce((a, b) => a + (b - m) ** 2, 0) /
      (sortedData.length - (besselsCorrection ? 1 : 0))
    : 0

export const stdev = ({
  data,
  sortedData = sort(data!),
  variance: v = variance({ sortedData }),
}:
  | (DataOrSortedData & { variance?: number })
  | (Partial<DataOrSortedData> & { variance: number })): number => Math.sqrt(v)

export const pooledVariance = ({
  besselsCorrection = false,
  data1,
  n1 = data1!.length,
  variance1 = variance({ data: data1!, besselsCorrection }),
  data2,
  n2 = data2!.length,
  variance2 = variance({ data: data2!, besselsCorrection }),
}: (
  | {
      data1: number[]
      n1?: number
      variance1?: number
      data2: number[]
      n2?: number
      variance2?: number
    }
  | {
      data1?: number[]
      n1: number
      variance1: number
      data2?: number[]
      n2: number
      variance2: number
    }
) & { besselsCorrection?: boolean }): number =>
  ((n1 - 1) * variance1 + (n2 - 1) * variance2) / (n1 + n2 - 2)

export const harmonicMean = (...numbers: number[]): number =>
  numbers.length / numbers.reduce((total, number) => total + 1 / number, 0)

export const distances = (data: number[]): number[] =>
  data.length === 0
    ? []
    : Array.from({ length: data.length - 1 }, (_, i) => data[i + 1]! - data[i]!)

export const consecutiveRatios = (data: number[]): number[] =>
  data.length === 0
    ? []
    : Array.from({ length: data.length - 1 }, (_, i) =>
        data[i] === 0 ? 0 : data[i + 1]! / data[i]!,
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

export const DEFAULT_QUANTILE_PRECISION_DELTA = 0.01
export const findSharpChangeQuantile = ({
  data,
  sortedData = sort(data!),
  precisionDelta = DEFAULT_QUANTILE_PRECISION_DELTA,
  lowestTestedQuantile = 0,
}: DataOrSortedData & {
  precisionDelta?: number
  lowestTestedQuantile?: number
}) => {
  if (precisionDelta >= 1) {
    throw new Error('precisionDelta must be less than 1')
  }
  const quantiles = Array.from(
    { length: (1 - lowestTestedQuantile) / precisionDelta },
    (_, i) => {
      const q = 1 - i * precisionDelta
      return quantile({ sortedData, q })
    },
  )
  const quantileDistances = distances(quantiles).map(Math.abs)
  const maximumDistance = Math.max(...quantileDistances)
  const maximumDistanceIndex = quantileDistances.indexOf(maximumDistance)
  const sharpestChangeQuantile = 1 - maximumDistanceIndex * precisionDelta
  return {
    q: sharpestChangeQuantile,
    qValue: quantiles[maximumDistanceIndex]!,
    qMinusDeltaValue: quantiles[maximumDistanceIndex + 1],
  }
}

export const getStableRandom = (seed: number = 1) =>
  function stableRandom() {
    // eslint-disable-next-line no-param-reassign
    if (seed === 0) seed++
    // eslint-disable-next-line no-param-reassign
    const x = Math.sin(seed++) * 10_000
    return x - Math.floor(x)
  }

export const histogramBy = <T, Comparable>(
  iterable: Iterable<T>,
  getValue: (i: T) => Comparable,
): (readonly [T[], number])[] => {
  const result = new Map<Comparable, number>()
  const map = new Map<Comparable, T[]>()

  for (const x of iterable) {
    const value = getValue(x)
    result.set(value, (result.get(value) ?? 0) + 1)
    if (!map.get(value)?.includes(x)) {
      map.set(value, [...(map.get(value) ?? []), x])
    }
  }

  return [...map].map(([key, value]) => [value, result.get(key) ?? 0] as const)
}

export const mostCommonBy = <T, Comparable>(
  iterable: Iterable<T>,
  getValue: (i: T) => Comparable,
): T[] => {
  let maxCount = 0
  let match: T[] = []

  for (const [keys, count] of histogramBy(iterable, getValue)) {
    if (count > maxCount) {
      maxCount = count
      match = keys
    }
  }

  return match
}

export const partition = <T, U extends T>(
  iterable: Iterable<T>,
  predicate: (val: T) => val is U,
): [U[], T[]] => {
  const left: U[] = []
  const right: T[] = []
  for (const val of iterable) {
    if (predicate(val)) {
      left.push(val)
    } else {
      right.push(val)
    }
  }
  return [left, right]
}
