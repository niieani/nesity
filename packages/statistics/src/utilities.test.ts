import { REAL_WORLD_DATA_12_SIMILAR_3_MODES } from './__fixtures__/testSamples'
import {
  consecutiveRatios,
  findSharpChangeQuantile,
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

describe('findSharpChangeQuantile', () => {
  it('should find the quantile that has the sharpest change in value', () => {
    const data = REAL_WORLD_DATA_12_SIMILAR_3_MODES.data2
    const ratios = consecutiveRatios(data)
    const sharpChangeQuantile = findSharpChangeQuantile({ data: ratios })
    expect(sharpChangeQuantile).toMatchInlineSnapshot(`
      Object {
        "q": 0.94,
        "qMinusDeltaValue": 1.065615423365112,
        "qValue": 1.0943418345907685,
      }
    `)
  })
})

describe('consecutiveRatios', () => {
  it('should calculate the ratios between consecutive numbers', () => {
    const data = REAL_WORLD_DATA_12_SIMILAR_3_MODES.data2
    expect(consecutiveRatios(data)).toMatchInlineSnapshot(`
      Array [
        1.0257721925660277,
        1.018988889421454,
        1.0399128449000516,
        1.0013032258840187,
        1.0032886338832736,
        1.01636094808713,
        1.1770338270482994,
        1.118276750888153,
        1.017476687887295,
        1.0239222269713282,
        1.0136538439986997,
        1.001826524686173,
        1.0012602393601635,
        1.0185055210302212,
        1.0012765251064293,
        1.0168708109294389,
        1.0025702633976896,
        1.0008058446121777,
        1.0044255065166816,
        1.0039207901720424,
        1.0018080289165396,
        1.00830842641711,
        1.0061224645001088,
        1.0042519891222828,
        1.0166743596870176,
        1.0217532962782143,
        1.0158548650319004,
        1.1155086639149363,
        1.0199063704506492,
        1.0018534632889835,
        1.0031031742734073,
        1.0134195744725834,
        1.0232038974467164,
        1.003669584194443,
        1.0027957022478515,
        1.0016149239008212,
        1.0025050004055724,
        1.013040698898338,
        1.0381375413445995,
      ]
    `)
  })
})
