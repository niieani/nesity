import { uniroot } from './uniroot.js'

describe('brentsRootFinding', () => {
  it('should find the root of a linear function', () => {
    const func = (x: number) => 2 * x - 3
    const root = uniroot(func, 0, 10, 1e-10)
    expect(root).toBeCloseTo(1.5, 10)
  })

  it('should find the root of a quadratic function', () => {
    const func = (x: number) => x * x - 2 * x + 1
    const root = uniroot(func, 0, 10, 1e-10)
    expect(root).toBeCloseTo(1, 8)
  })

  it('should find the root of a sinusoidal function', () => {
    const func = (x: number) => Math.sin(x)
    const root = uniroot(func, 1, 2 * Math.PI, 1e-10)
    expect(root).toBeCloseTo(Math.PI, 10)
  })

  it('should throw an error if the maximum number of iterations is exceeded', () => {
    const func = (x: number) => x - x + 1
    expect(() =>
      uniroot(func, 0, 10, 1e-10, 1),
    ).toThrowErrorMatchingInlineSnapshot(
      `"Maximum number of iterations exceeded"`,
    )
  })
})
