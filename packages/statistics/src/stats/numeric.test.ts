import { bisection, secant } from './numeric.js'

describe('#bisection', () => {
  it('should return the correct value', () => {
    expect(bisection(Math.sin, 3, 4)).toBeCloseTo(Math.PI, 8)
  })
})
describe('#secant', () => {
  it('should return the correct value', () => {
    expect(secant(Math.sin, 3, 4)).toBeCloseTo(Math.PI, 8)
  })
})
