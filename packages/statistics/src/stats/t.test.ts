import { twoSampleTTest } from './t.js'
import { Vector } from './vector.js'

describe('StudentT', () => {
  const first = new Vector([
    26, 21, 22, 26, 19, 22, 26, 25, 24, 21, 23, 23, 18, 29, 22,
  ])
  const second = new Vector([
    18, 23, 21, 20, 20, 29, 20, 16, 20, 26, 21, 25, 17, 18, 19,
  ])
  const st = twoSampleTTest(first, second)

  it('Degrees of freedom (df) should be correct', () => {
    expect(st.df).toBe(28)
  })

  it('T statistic should be correct', () => {
    expect(st.t).toBeCloseTo(1.910_9, 4)
  })

  it('P-value should be correct', () => {
    expect(st.p).toBeCloseTo(0.066_3, 4)
  })
})
