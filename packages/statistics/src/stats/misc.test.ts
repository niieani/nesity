import { beta, erf, ibeta, rbeta } from './misc.js'

describe('beta', () => {
  it('beta should return the correct value', () => {
    expect(beta(1, 1)).toBeCloseTo(1, 5)
    expect(beta(2, 2)).toBeCloseTo(0.166_666_7, 7)
    expect(beta(2, 3)).toBeCloseTo(0.083_333_33, 8)
    expect(beta(10, 10)).toBeCloseTo(0.000_001_082_509, 12)
  })

  it('ibeta should return the correct value', () => {
    expect(ibeta(0.01, 2, 2)).toBeCloseTo(0.000_049_666_67, 8)
    expect(ibeta(0.1, 2, 2)).toBeCloseTo(0.004_667, 6)
    expect(ibeta(0.2, 2, 2)).toBeCloseTo(0.017_333, 6)
    expect(ibeta(0.9, 2, 2)).toBeCloseTo(0.162, 3)
  })

  it('rbeta should return the correct value', () => {
    expect(rbeta(0.01, 2, 2)).toBeCloseTo(0.000_298, 6)
    expect(rbeta(0.1, 2, 2)).toBeCloseTo(0.028, 3)
    expect(rbeta(0.2, 2, 2)).toBeCloseTo(0.104, 3)
    expect(rbeta(0.9, 2, 2)).toBeCloseTo(0.972, 3)
  })
})

describe('erf', () => {
  it('erf should return the correct value', () => {
    expect(erf(0.001)).toBeCloseTo(0.001_128_379, 9)
    expect(erf(0.1)).toBeCloseTo(0.112_462_916, 9)
    expect(erf(0.5)).toBeCloseTo(0.520_499_878, 9)
    expect(erf(1)).toBeCloseTo(0.842_700_793, 9)
    expect(erf(3)).toBeCloseTo(0.999_977_91, 9)
    expect(erf(-3)).toBeCloseTo(-0.999_977_91, 9)
  })
})
