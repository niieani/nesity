import { Vector } from './vector.js'

describe('Vector', () => {
  it('length() should return the correct length', () => {
    const v = new Vector([])
    v.push(1, 2)
    expect(v.length()).toBe(2)
  })
  it('skewness() should return the correct skewness', () => {
    const v = new Vector([-6, 2, 15, -6, 10, 7, 3, 8, 11, -2])
    expect(v.skewness()).toBeCloseTo(-0.162_7, 4)
  })
  it('kurtosis() should return the correct kurtosis', () => {
    const v = new Vector([-6, 2, 15, -6, 10, 7, 3, 8, 11, -2])
    expect(v.kurtosis()).toBeCloseTo(1.811_8, 4)
  })
  it('geomean() should return the correct geometric mean', () => {
    const v = new Vector([1, 2, 3, 10])
    expect(v.geomean()).toBeCloseTo(2.783_158, 6)
  })
  it('median() should return the correct median for even length', () => {
    const v = new Vector([1, 5, 3, 2])
    expect(v.median()).toBe(2.5)
  })

  it('median() should return the correct median for odd length', () => {
    const v = new Vector([1, 5, 3, 2, 4])
    expect(v.median()).toBe(3)
  })

  it('median() should return the correct median for two elements', () => {
    const v = new Vector([1, 2])
    expect(v.median()).toBe(1.5)
  })
  it('q1() should return the correct first quartile', () => {
    let v = new Vector([1, 5, 3, 2])
    expect(v.q1()).toBe(1.5)
    v = new Vector([1, 5, 3, 2, 4])
    expect(v.q1()).toBe(1.5)
  })
  it('q3() should return the correct third quartile', () => {
    let v = new Vector([1, 5, 3, 2])
    expect(v.q3()).toBe(4)
    v = new Vector([1, 5, 3, 2, 4])
    expect(v.q3()).toBe(4.5)
  })
})
