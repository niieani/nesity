import type { GetSplitsReturnType } from '../modality/getSplits'
import { getSplitsWithQuantiles } from '../modality/getSplits'
import type { SplitMultimodalDistributionWithQuantilesOptions } from '../modality/splitMultimodalDistributionWithQuantiles'
import { OptimizationResult, optimize } from '../optimize'
import {
  compareSplitPermutations,
  getCachedCompareFunction,
} from './compareSplitPermutations'
import type { CompareWithDenoisingOptionsBase, ComparisonResult } from './types'

export interface CompareWithQuantileDenoisingOptions
  extends CompareWithDenoisingOptionsBase {
  quantileOptions?: SplitMultimodalDistributionWithQuantilesOptions
}

export interface QuantileOptimizationParameters {
  shouldSplit1: boolean
  shouldSplit2: boolean
}

export function compareWithQuantileDenoising({
  data1,
  data2,
  sorted1,
  sorted2,
  confidenceLevel,
  comparisonQualityWeightingOptions = {},
  getOutcomeOptions,
  minimalModalitySize,
  minimumUsedToTotalSamplesRatio,
  quantileOptions,
}: CompareWithQuantileDenoisingOptions): OptimizationResult<
  QuantileOptimizationParameters,
  readonly [GetSplitsReturnType, GetSplitsReturnType],
  ComparisonResult
>[] {
  const getSplitsForConfiguration = ({
    shouldSplit1,
    shouldSplit2,
  }: {
    shouldSplit1?: boolean
    shouldSplit2?: boolean
  }): readonly [GetSplitsReturnType, GetSplitsReturnType] => {
    const split1 = !shouldSplit1
      ? ({
          largestModalityIndex: 0,
          largestSplitIndex: 0,
          modalities: [sorted1],
          modalityCount: 1,
          rawSplits: [sorted1],
          rawSplitsSortedBySize: [sorted1],
          separateModalitySizeThreshold: 0,
          splitsAndTheirDistribution: [[sorted1, 1]],
        } as const)
      : getSplitsWithQuantiles({
          sortedData: sorted1,
          ...quantileOptions,
        })
    const split2 = !shouldSplit2
      ? ({
          largestModalityIndex: 0,
          largestSplitIndex: 0,
          modalities: [sorted2],
          modalityCount: 1,
          rawSplits: [sorted2],
          rawSplitsSortedBySize: [sorted2],
          separateModalitySizeThreshold: 0,
          splitsAndTheirDistribution: [[sorted2, 1]],
        } as const)
      : getSplitsWithQuantiles({
          sortedData: sorted2,
          ...quantileOptions,
        })
    return [split1, split2] as const
  }

  const ITERATIONS = 4
  // try out different kernelStretchFactors automatically to find the best one
  // optimizing for lowest pooled stdev difference
  const bestComparisons = optimize({
    iterate: getSplitsForConfiguration,
    getNextIterationArgument(iteration) {
      // we want 4 iterations: split vs split, split vs unsplit, unsplit vs split, unsplit vs unsplit
      const shouldSplit1 =
        iteration % ITERATIONS === 0 || iteration % ITERATIONS === 1
      const shouldSplit2 =
        iteration % ITERATIONS === 0 || iteration % ITERATIONS === 2
      return {
        shouldSplit1,
        shouldSplit2,
      } as const
    },
    iterations: ITERATIONS,
    getComparisonCache: (allResults) => {
      const splitPermutations = allResults.map(([, splits]) => splits)

      return compareSplitPermutations({
        data1,
        data2,
        minimalModalitySize,
        splitPermutations,
        confidenceLevel,
        getOutcomeOptions,
        minimumUsedToTotalSamplesRatio,
      })
    },
    compare: getCachedCompareFunction(comparisonQualityWeightingOptions),
    reverseCompareMeta: (comparisons) => comparisons,
  })
  return bestComparisons
}
