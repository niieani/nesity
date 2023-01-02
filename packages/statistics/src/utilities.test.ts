import { pooledVariance, variance } from './utilities'

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
