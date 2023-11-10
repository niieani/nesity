import { pearson } from './correlation.js'
import { Vector } from './vector.js'

describe('Correlation', () => {
  const g = new Vector([
    8.3, 8.6, 8.8, 10.5, 10.7, 10.8, 11, 11, 11.1, 11.2, 11.3, 11.4, 11.4, 11.7,
    12, 12.9, 12.9, 13.3, 13.7, 13.8, 14, 14.2, 14.5, 16, 16.3, 17.3, 17.5,
    17.9, 18, 18, 20.6,
  ])
  const h = new Vector([
    70, 65, 63, 72, 81, 83, 66, 75, 80, 75, 79, 76, 76, 69, 75, 74, 85, 86, 71,
    64, 78, 80, 74, 72, 77, 81, 82, 80, 80, 80, 87,
  ])

  const p = pearson(g, h)

  it('pearson should return the correct values', () => {
    expect(p.r).toBeCloseTo(0.519_280_1, 7)
    expect(p.df).toBe(29)
    expect(p.t).toBeCloseTo(3.272_2, 4)
    expect(p.p).toBeCloseTo(0.002_758, 6)
  })
})
