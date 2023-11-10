import { linear } from './regression.js'
import { Vector } from './vector.js'

describe('Regression', () => {
  const w = new Vector([
    0.2, 0.2, 0.2, 0.2, 0.2, 0.4, 0.3, 0.2, 0.2, 0.1, 0.2, 0.2, 0.1, 0.1, 0.2,
    0.4, 0.4, 0.3, 0.3, 0.3, 0.2, 0.4, 0.2, 0.5, 0.2, 0.2, 0.4, 0.2, 0.2, 0.2,
    0.2, 0.4, 0.1, 0.2, 0.2, 0.2, 0.2, 0.1, 0.2, 0.2, 0.3, 0.3, 0.2, 0.6, 0.4,
    0.3, 0.2, 0.2, 0.2, 0.2, 1.4, 1.5, 1.5, 1.3, 1.5, 1.3, 1.6, 1, 1.3, 1.4, 1,
    1.5, 1, 1.4, 1.3, 1.4, 1.5, 1, 1.5, 1.1, 1.8, 1.3, 1.5, 1.2, 1.3, 1.4, 1.4,
    1.7, 1.5, 1, 1.1, 1, 1.2, 1.6, 1.5, 1.6, 1.5, 1.3, 1.3, 1.3, 1.2, 1.4, 1.2,
    1, 1.3, 1.2, 1.3, 1.3, 1.1, 1.3, 2.5, 1.9, 2.1, 1.8, 2.2, 2.1, 1.7, 1.8,
    1.8, 2.5, 2, 1.9, 2.1, 2, 2.4, 2.3, 1.8, 2.2, 2.3, 1.5, 2.3, 2, 2, 1.8, 2.1,
    1.8, 1.8, 1.8, 2.1, 1.6, 1.9, 2, 2.2, 1.5, 1.4, 2.3, 2.4, 1.8, 1.8, 2.1,
    2.4, 2.3, 1.9, 2.3, 2.5, 2.3, 1.9, 2, 2.3, 1.8,
  ])
  const l = new Vector([
    1.4, 1.4, 1.3, 1.5, 1.4, 1.7, 1.4, 1.5, 1.4, 1.5, 1.5, 1.6, 1.4, 1.1, 1.2,
    1.5, 1.3, 1.4, 1.7, 1.5, 1.7, 1.5, 1, 1.7, 1.9, 1.6, 1.6, 1.5, 1.4, 1.6,
    1.6, 1.5, 1.5, 1.4, 1.5, 1.2, 1.3, 1.4, 1.3, 1.5, 1.3, 1.3, 1.3, 1.6, 1.9,
    1.4, 1.6, 1.4, 1.5, 1.4, 4.7, 4.5, 4.9, 4, 4.6, 4.5, 4.7, 3.3, 4.6, 3.9,
    3.5, 4.2, 4, 4.7, 3.6, 4.4, 4.5, 4.1, 4.5, 3.9, 4.8, 4, 4.9, 4.7, 4.3, 4.4,
    4.8, 5, 4.5, 3.5, 3.8, 3.7, 3.9, 5.1, 4.5, 4.5, 4.7, 4.4, 4.1, 4, 4.4, 4.6,
    4, 3.3, 4.2, 4.2, 4.2, 4.3, 3, 4.1, 6, 5.1, 5.9, 5.6, 5.8, 6.6, 4.5, 6.3,
    5.8, 6.1, 5.1, 5.3, 5.5, 5, 5.1, 5.3, 5.5, 6.7, 6.9, 5, 5.7, 4.9, 6.7, 4.9,
    5.7, 6, 4.8, 4.9, 5.6, 5.8, 6.1, 6.4, 5.6, 5.1, 5.6, 6.1, 5.6, 5.5, 4.8,
    5.4, 5.6, 5.1, 5.1, 5.9, 5.7, 5.2, 5, 5.2, 5.4, 5.1,
  ])
  const lm1 = linear(l, w)
  const y = new Vector([2_000, 2_001, 2_002, 2_003, 2_004])
  const r = new Vector([9.34, 8.5, 7.62, 6.93, 6.6])
  const lm2 = linear(y, r)

  it('slope should return the correct value', () => {
    expect(lm1.slope).toBeCloseTo(0.415_755, 6)
    expect(lm2.slope).toBeCloseTo(-0.705, 5)
  })

  it('intercept should return the correct value', () => {
    expect(lm1.intercept).toBeCloseTo(-0.363_076, 6)
    expect(lm2.intercept).toBeCloseTo(1_419.208, 5)
  })

  it('R-squared should return the correct value', () => {
    expect(lm1.rs).toBeCloseTo(0.927_1, 4)
    expect(lm2.rs).toBeCloseTo(0.976, 3)
  })

  it('T value for the slope should be correct', () => {
    expect(lm1.slope_t).toBeCloseTo(43.387, 3)
    expect(lm2.slope_t).toBeCloseTo(-11.12, 2)
  })

  it('T value for the intercept should be correct', () => {
    expect(lm1.intercept_t).toBeCloseTo(-9.131, 3)
    expect(lm2.intercept_t).toBeCloseTo(11.18, 2)
  })

  it('P value for the slope should be correct', () => {
    expect(lm1.slope_p).toBeCloseTo(0, 9)
    expect(lm2.slope_p).toBeCloseTo(0.001_56, 5)
  })

  it('P value for the intercept should be correct', () => {
    expect(lm1.intercept_p).toBeCloseTo(0, 9)
    expect(lm2.intercept_p).toBeCloseTo(0.001_53, 5)
  })
})
