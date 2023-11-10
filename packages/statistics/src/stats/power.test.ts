import { sampleSize } from './power.js'

describe('Power', () => {
  it('sampleSize should return the correct sample size', () => {
    expect(sampleSize(0.05, 0.8, 0.72, 0.15)).toBeCloseTo(362, 0)
  })
})
