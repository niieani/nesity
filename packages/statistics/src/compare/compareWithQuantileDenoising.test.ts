import { compareWithQuantileDenoising } from './compareWithQuantileDenoising.js'

const data = {
  data1: [
    5.5, 5.799, 5.801, 6.1, 6.699, 6.7, 6.801, 6.899, 7.699, 7.8, 7.9, 7.901,
    12.199, 25.2, 29.3, 32.701, 39.1, 39.5, 44.3, 45, 51.199, 55.4, 469.4,
    559.901,
  ],
  data2: [
    5.1, 5.699, 5.9, 6.201, 6.7, 7.2, 7.3, 9.2, 20.7, 22, 23.5, 24.1, 25.301,
    47.4, 49.101, 457.901, 477, 478.801, 486.299, 512.8, 533.3, 550.7, 584.5,
    701.9,
  ],
  sorted1: [
    5.5, 5.799, 5.801, 6.1, 6.699, 6.7, 6.801, 6.899, 7.699, 7.8, 7.9, 7.901,
    12.199, 25.2, 29.3, 32.701, 39.1, 39.5, 44.3, 45, 51.199, 55.4, 469.4,
    559.901,
  ],
  sorted2: [
    5.1, 5.699, 5.9, 6.201, 6.7, 7.2, 7.3, 9.2, 20.7, 22, 23.5, 24.1, 25.301,
    47.4, 49.101, 457.901, 477, 478.801, 486.299, 512.8, 533.3, 550.7, 584.5,
    701.9,
  ],
  stdev1: 141.114_822_547_120_95,
  stdev2: 258.219_652_603_878_6,
  confidenceLevel: 0.95,
  getOutcomeOptions: {
    minimalAbsoluteChangeProbability: 0.6,
    requireTwoSidedNullHypothesisRejection: true,
  },
  minimalModalitySize: 4,
  minimumUsedToTotalSamplesRatio: 0.6,
  comparisonQualityWeightingOptions: { discardedDataPenaltyFactor: 0.7 },
}

describe('compare using quantile denoising', () => {
  it('should compare two datasets', () => {
    const bestComparisons = compareWithQuantileDenoising(data)
    expect(bestComparisons).toHaveLength(1)
    expect(bestComparisons[0]?.[2].outcome).toBe('similar')
    expect(bestComparisons.every(([a, b, c]) => Boolean(c))).toBe(true)
  })
})
