import {
  REAL_WORLD_DATA_1,
  REAL_WORLD_DATA_2_SIMILAR,
  REAL_WORLD_DATA_3_SIMILAR,
  REAL_WORLD_DATA_4_SIMILAR,
  REAL_WORLD_DATA_5_BIMODAL,
  REAL_WORLD_DATA_6_GREATER,
  REAL_WORLD_DATA_7_BIMODAL,
  REAL_WORLD_DATA_8_SIMILAR,
  REAL_WORLD_DATA_9_SIMILAR_VERY_NOISY,
  REAL_WORLD_DATA_10_SIMILAR_NOISY,
  REAL_WORLD_DATA_11_GREATER,
  REAL_WORLD_DATA_12_SIMILAR_3_MODES,
} from '../__fixtures__/testSamples.js'
import { getStableRandom } from '../utilities.js'
import { compare } from './compare.js'
import type { DenoisingAndModalitySplittingOptions } from './types.js'

const kdeOptions = {
  noiseValuesPerSample: 2,
  random: getStableRandom(5_000),
  iterations: 15,
}

describe.each([
  {
    type: 'kde',
    options: kdeOptions,
  },
  { type: 'quantile' },
] as DenoisingAndModalitySplittingOptions[])(
  'compare using $type denoising',
  (denoisingAndModalitySplittingOptions) => {
    beforeEach(() => {
      kdeOptions.random = getStableRandom(5_000)
    })

    it('should compare two datasets', () => {
      const START = 20
      const SIZE = 16
      const { originalResult, ...result } = compare({
        data1: REAL_WORLD_DATA_1.sample1.slice(START, START + SIZE),
        data2: REAL_WORLD_DATA_1.sample2.slice(START, START + SIZE),
        denoisingAndModalitySplittingOptions,
      })

      expect(result.outcome).toBe('similar')
      expect(result).toMatchSnapshot()
    })

    it('should compare two small datasets with noise iterations (similar 1)', () => {
      const { originalResult, ...result } = compare({
        data1: REAL_WORLD_DATA_3_SIMILAR.data1,
        data2: REAL_WORLD_DATA_3_SIMILAR.data2,
        denoisingAndModalitySplittingOptions,
      })

      expect(result.outcome).toBe('similar')
      expect(result).toMatchSnapshot()
    })

    it('should compare two small datasets with noise iterations (similar)', () => {
      const { originalResult, ...result } = compare({
        data1: REAL_WORLD_DATA_4_SIMILAR.data1,
        data2: REAL_WORLD_DATA_4_SIMILAR.data2,
        denoisingAndModalitySplittingOptions,
      })

      expect(result.outcome).toBe('similar')
      expect(result).toMatchSnapshot()
    })

    it('should compare two small datasets with noise iterations (similar - different sample)', () => {
      const { originalResult, ...result } = compare({
        data1: REAL_WORLD_DATA_2_SIMILAR.data1,
        data2: REAL_WORLD_DATA_2_SIMILAR.data2,
        denoisingAndModalitySplittingOptions,
      })

      expect(result.outcome).toBe('similar')
      expect(result).toMatchSnapshot()
    })

    it('should compare two small datasets with noise iterations (bimodal)', () => {
      const { originalResult, ...result } = compare({
        ...REAL_WORLD_DATA_5_BIMODAL,
        denoisingAndModalitySplittingOptions,
      })

      expect(result.outcome).toBe('similar')
      expect(result.data1.dataCount + result.data1.discardedCount).toBe(16)
      expect(result.data2.dataCount + result.data2.discardedCount).toBe(16)
      expect(result).toMatchSnapshot()
    })

    it('should compare two small datasets with noise iterations (bimodal 2)', () => {
      const { originalResult, ...result } = compare({
        ...REAL_WORLD_DATA_7_BIMODAL,
        denoisingAndModalitySplittingOptions,
      })

      expect(result.outcome).toBe('similar')
      expect(result).toMatchSnapshot()
    })

    it('should compare two small datasets with noise iterations (similar 2)', () => {
      const { originalResult, ...result } = compare({
        ...REAL_WORLD_DATA_8_SIMILAR,
        denoisingAndModalitySplittingOptions,
      })

      expect(result.outcome).toBe('similar')
      expect(result).toMatchSnapshot()
    })

    it('should compare two datasets with noise iterations (similar 3)', () => {
      const { originalResult, ...result } = compare({
        ...REAL_WORLD_DATA_9_SIMILAR_VERY_NOISY,
        denoisingAndModalitySplittingOptions,
      })

      expect(result.outcome).toBe('similar')
      expect(result).toMatchSnapshot()
    })

    it('should compare two datasets with noise iterations (similar 4)', () => {
      const { originalResult, ...result } = compare({
        ...REAL_WORLD_DATA_10_SIMILAR_NOISY,
        denoisingAndModalitySplittingOptions,
      })

      expect(result.outcome).toBe('similar')
      expect(result).toMatchSnapshot()
    })

    it('should compare two small datasets with noise iterations (greater)', () => {
      const { originalResult, ...result } = compare({
        ...REAL_WORLD_DATA_6_GREATER,
        denoisingAndModalitySplittingOptions,
      })

      expect(result.outcome).toBe('greater')
      expect(result).toMatchSnapshot()
    })

    it('should compare two small datasets with noise iterations (significantly greater)', () => {
      const { originalResult, ...result } = compare({
        ...REAL_WORLD_DATA_11_GREATER,
        denoisingAndModalitySplittingOptions,
      })

      expect(result.outcome).toBe('greater')
      expect(result).toMatchSnapshot()
    })

    it('should compare two larger datasets with 3 modalities', () => {
      const { originalResult, ...result } = compare({
        ...REAL_WORLD_DATA_12_SIMILAR_3_MODES,
        denoisingAndModalitySplittingOptions,
      })

      expect(result.outcome).toBe('similar')
      expect(result).toMatchSnapshot()
    })

    it('should compare two dataset with varying lengths', () => {
      const { originalResult, ...result } = compare({
        data1: [13.945, 14.055, 16.372, 30.464, 33.407, 68.132],
        data2: [30.142, 52.941],
        denoisingAndModalitySplittingOptions,
      })

      expect(result.outcome).toBe('similar')
      expect(result).toMatchSnapshot()
    })

    it('should compare two identical datasets of exactly one data point', () => {
      const { originalResult, ...result } = compare({
        data1: [58],
        data2: [58],
        denoisingAndModalitySplittingOptions,
      })

      expect(result.outcome).toBe('equal')
      expect(result).toMatchSnapshot()
    })

    it('should compare two different datasets of exactly one data point', () => {
      const { originalResult, ...result } = compare({
        data1: [58],
        data2: [59],
        denoisingAndModalitySplittingOptions,
      })

      expect(result.outcome).toBe('greater')
      expect(result).toMatchSnapshot()
    })

    it('should compare two identical datasets of exactly two data points', () => {
      const { originalResult, ...result } = compare({
        data1: [58, 58],
        data2: [58, 58],
        denoisingAndModalitySplittingOptions,
      })

      expect(result.outcome).toBe('equal')
      expect(result).toMatchSnapshot()
    })

    it('should compare two different datasets of exactly the same two data points', () => {
      const { originalResult, ...result } = compare({
        data1: [58, 58],
        data2: [158, 158],
        denoisingAndModalitySplittingOptions,
      })

      expect(result.outcome).toBe('greater')
      expect(result).toMatchSnapshot()
    })

    it('should compare two different datasets of exactly the same 3 data points', () => {
      const { originalResult, ...result } = compare({
        data1: [58, 58, 58],
        data2: [158, 158, 158],
        denoisingAndModalitySplittingOptions,
      })

      expect(result.outcome).toBe('greater')
      expect(result).toMatchSnapshot()
    })

    it('should compare two different datasets of 4 exactly the same data points', () => {
      const { originalResult, ...result } = compare({
        data1: [58, 58, 58, 58],
        data2: [158, 158, 158, 158],
        denoisingAndModalitySplittingOptions,
      })

      expect(result.outcome).toBe('greater')
      expect(result).toMatchSnapshot()
    })

    it('should compare two different datasets with two different data points', () => {
      const { originalResult, ...result } = compare({
        data1: [58, 59],
        data2: [158, 159],
        denoisingAndModalitySplittingOptions,
      })

      expect(result.outcome).toBe('greater')
      expect(result).toMatchSnapshot()
    })

    it('should compare two different datasets of 3 different data points', () => {
      const { originalResult, ...result } = compare({
        data1: [57, 58, 59],
        data2: [157, 158, 159],
        denoisingAndModalitySplittingOptions,
      })

      expect(result.outcome).toBe('greater')
      expect(result).toMatchSnapshot()
    })

    it('should compare two different datasets of 4 mixed data points', () => {
      const { originalResult, ...result } = compare({
        data1: [55, 56, 57, 58],
        data2: [158, 158, 158, 158],
        denoisingAndModalitySplittingOptions,
      })

      expect(result.outcome).toBe('greater')
      expect(result).toMatchSnapshot()
    })
  },
)
