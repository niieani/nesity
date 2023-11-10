import { Kolmogorov, Normal, T } from './distributions.js'

describe('Distributions', () => {
  const n = new Normal(0, 1)
  const n2 = new Normal(1.2, 1.8)

  // Normal distribution tests
  it('Normal density function should return correct values', () => {
    expect(n.dens(0)).toBeCloseTo(0.398_942_3, 7)
    expect(n.dens(1)).toBeCloseTo(0.241_970_7, 7)
    expect(n.dens(2)).toBeCloseTo(0.053_990_97, 8)
    expect(n.dens(3)).toBeCloseTo(0.004_431_848, 9)
    expect(n.dens(4)).toBeCloseTo(0.000_133_830_2, 10)
    expect(n.dens(5)).toBeCloseTo(0.000_001_486_72, 11)
  })

  it('Normal distribution function should return correct values', () => {
    expect(n.distr(0)).toBeCloseTo(0.5, 7)
    expect(n.distr(1)).toBeCloseTo(0.841_344_7, 7)
    expect(n.distr(2)).toBeCloseTo(0.977_249_9, 7)
    expect(n.distr(3)).toBeCloseTo(0.998_650_1, 7)
    expect(n.distr(4)).toBeCloseTo(0.999_968_3, 7)
    expect(n.distr(5)).toBeCloseTo(0.999_999_7, 7)
  })

  it('Normal inverse distribution function should return correct values', () => {
    expect(n.inverse(0.01)).toBeCloseTo(-2.326_348, 6)
    expect(n.inverse(0.1)).toBeCloseTo(-1.281_552, 6)
    expect(n2.inverse(0.01)).toBeCloseTo(-2.987_426, 6)
    expect(n2.inverse(0.1)).toBeCloseTo(-1.106_793, 6)
  })

  const t = new T(100)
  const t1 = new T(1)
  // T distribution tests
  it('T density function should return correct values', () => {
    expect(t.dens(-5)).toBeCloseTo(0.000_005_08, 9)
    expect(t.dens(-4)).toBeCloseTo(0.000_221_155, 9)
    expect(t.dens(-3)).toBeCloseTo(0.005_126_09, 8)
    expect(t.dens(-2)).toBeCloseTo(0.054_908_64, 8)
    expect(t.dens(-1)).toBeCloseTo(0.240_765_9, 7)
    expect(t.dens(0)).toBeCloseTo(0.397_946_2, 7)
  })

  it('T distribution function should return correct values', () => {
    expect(t.distr(-5)).toBeCloseTo(0.000_001_225_087, 9)
    expect(t.distr(-3)).toBeCloseTo(0.001_703_958, 6)
    expect(t.distr(-1)).toBeCloseTo(0.159_862_1, 4)
    // Uncomment the following line if you want to test the median value
    // expect(t.distr(0)).toBeCloseTo(0.5, 7);
    expect(t.distr(5)).toBeCloseTo(0.999_998_8, 7)
    // Uncomment the following line if you want to test a T distribution with df = 1
    // expect(t1.distr(-5)).toBeCloseTo(0.01224269, 6);
  })

  it('T inverse distribution function should return correct values', () => {
    expect(t.inverse(0.000_012_3)).toBeCloseTo(-4.425_138, 6)
    // Uncomment the following line if you want to test the median value
    // expect(t.inverse(0.5)).toBeCloseTo(0.000000, 6);
    expect(t.inverse(0.987_6)).toBeCloseTo(2.278_881, 6)
  })

  const k = new Kolmogorov()
  // Kolmogorov distribution tests
  it('Kolmogorov distribution function should return correct values', () => {
    expect(k.distr(1)).toBeCloseTo(0.73, 2)
    expect(k.distr(0.8)).toBeCloseTo(0.455_86, 5)
    expect(k.distr(0.6)).toBeCloseTo(0.135_72, 5)
    expect(k.distr(0.5)).toBeCloseTo(0.036_05, 5)
  })
})
