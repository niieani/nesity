import { normal, normalLower, normalUpper } from './confidence.js'
import { Vector } from './vector.js'

describe('Confidence', () => {
  const v = new Vector([
    44_617, 7_066, 17_594, 2_726, 1_178, 18_898, 5_033, 37_151, 4_514, 4_000,
  ])
  const v2 = new Vector([19.9, 29.6, 18.7, 24.2])

  it('normal should return the correct confidence interval', () => {
    const interval = normal(v, 0.95)
    expect(interval[0]).toBeCloseTo(3_299.868, 3)
    expect(interval[1]).toBeCloseTo(25_255.532, 3)
    expect(normalLower(v2, 0.95)).toBeCloseTo(17.29, 2)
    expect(normalUpper(v, 0.95)).toBeCloseTo(23_173.46, 2)
  })
})
