import {
  histogramBy,
  mostCommonBy,
  pooledVariance,
  variance,
} from './utilities'

describe('variance', () => {
  it('should calculate the variance of an array of numbers', () => {
    expect(variance({ data: [3, 5, 8, 1] })).toBe(6.687_5)
    expect(variance({ data: [1, 2, 3, 4, 5] })).toBe(2)
    expect(variance({ data: [2, 4, 6, 8, 10] })).toBe(8)
    expect(variance({ data: [-2, 0, 2, 4, 6] })).toBe(8)
  })

  it('should handle arrays with a single value', () => {
    expect(variance({ data: [1] })).toBe(0)
    expect(variance({ data: [-2] })).toBe(0)
    expect(variance({ data: [0] })).toBe(0)
  })

  it('should handle empty arrays', () => {
    expect(variance({ data: [] })).toBe(0)
  })
})

describe('pooledVariance', () => {
  it('should calculate the pooled variance of two arrays of numbers', () => {
    expect(
      Math.sqrt(
        pooledVariance({
          variance1: 6.4 ** 2,
          n1: 15,
          variance2: 8.2 ** 2,
          n2: 19,
        }),
      ),
    ).toBeCloseTo(7.466, 3)
  })
})

describe('mostCommonBy', () => {
  it('returns the most common values according to the provided key function', () => {
    const mostCommon = mostCommonBy(
      [{ v: 1 }, { v: 2 }, { v: 3 }, { v: 4 }, { v: 2 }],
      (i) => i.v,
    )
    expect(mostCommon).toEqual([{ v: 2 }, { v: 2 }])
  })

  it('returns all values if all values are the most common', () => {
    const mostCommon = mostCommonBy([{ v: 1 }, { v: 1 }, { v: 1 }], (i) => i.v)
    expect(mostCommon).toEqual([{ v: 1 }, { v: 1 }, { v: 1 }])
  })

  it('returns an empty array if the iterable is empty', () => {
    const mostCommon = mostCommonBy([], (i) => i)
    expect(mostCommon).toEqual([])
  })
})

describe('histogramBy', () => {
  it('creates a histogram of values according to the provided key function', () => {
    const histogram = histogramBy(
      [{ v: 1 }, { v: 2 }, { v: 3 }, { v: 4 }, { v: 2 }],
      (i) => i.v,
    )
    expect(histogram).toEqual([
      [[{ v: 1 }], 1],
      [[{ v: 2 }, { v: 2 }], 2],
      [[{ v: 3 }], 1],
      [[{ v: 4 }], 1],
    ])
  })

  it('returns an empty array if the iterable is empty', () => {
    const histogram = histogramBy([], (i) => i)
    expect(histogram).toEqual([])
  })
})
