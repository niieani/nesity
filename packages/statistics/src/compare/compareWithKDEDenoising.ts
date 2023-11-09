import {
  calculateSilvermansRuleOfThumbBandwidth,
  optimalThreshold,
} from '../kernelDensityEstimate.js'
import type { GetSplitsReturnType } from '../modality/getSplits.js'
import { getSplitsWithKDE } from '../modality/getSplits.js'
import { OptimizationResult, optimize } from '../optimize.js'
import {
  compareSplitPermutations,
  getCachedCompareFunction,
} from './compareSplitPermutations.js'
import {
  DEFAULT_KERNEL_STRETCH_FACTOR_RANGE,
  DEFAULT_KERNEL_STRETCH_FACTOR_SEARCH_STEP_SIZE,
  DEFAULT_NOISE_VALUES_PER_SAMPLE,
} from './defaults.js'
import type {
  CompareWithDenoisingOptionsBase,
  ComparisonResult,
  KDEDenoisingOptions,
} from './types.js'

export interface CompareWithKDEDenoisingOptions
  extends CompareWithDenoisingOptionsBase {
  kdeOptions?: KDEDenoisingOptions
}

export interface KDEOptimizationParameters {
  kernelStretchFactor: number
  bandwidth: number
  threshold: number
  shouldSplit1: boolean
  shouldSplit2: boolean
}

export function compareWithKDEDenoising({
  data1,
  data2,
  sorted1,
  sorted2,
  stdev1,
  stdev2,
  confidenceLevel,
  kdeOptions: {
    precisionDelta,
    noiseValuesPerSample = DEFAULT_NOISE_VALUES_PER_SAMPLE,
    random,
    iterations,
    minimumVelocityToFirstQuartileRatio,
    kernelStretchFactorRange: [
      kernelStretchFactorLowerRange,
      kernelStretchFactorUpperRange,
    ] = DEFAULT_KERNEL_STRETCH_FACTOR_RANGE,
    kernelStretchFactorSearchStepSize = DEFAULT_KERNEL_STRETCH_FACTOR_SEARCH_STEP_SIZE,
  } = {},
  comparisonQualityWeightingOptions = {},
  getOutcomeOptions,
  minimalModalitySize,
  minimumUsedToTotalSamplesRatio,
}: CompareWithKDEDenoisingOptions): OptimizationResult<
  KDEOptimizationParameters,
  readonly [GetSplitsReturnType, GetSplitsReturnType],
  ComparisonResult
>[] {
  if (noiseValuesPerSample <= 0) {
    throw new Error('noiseValuesPerSample must be greater than 0')
  }
  const [threshold1, threshold2] = [
    optimalThreshold({
      sortedData: sorted1,
      stdev: stdev1,
      minimumVelocityToFirstQuartileRatio,
      precisionDelta,
    }),
    optimalThreshold({
      sortedData: sorted2,
      stdev: stdev2,
      minimumVelocityToFirstQuartileRatio,
      precisionDelta,
    }),
  ]
  const [bandwidth1, bandwidth2] = [
    calculateSilvermansRuleOfThumbBandwidth({
      sortedData: sorted1,
      threshold: threshold1.value,
    }),
    calculateSilvermansRuleOfThumbBandwidth({
      sortedData: sorted2,
      threshold: threshold2.value,
    }),
  ]

  const bandwidthsNumerator = 1 / kernelStretchFactorSearchStepSize
  const optimizationIterations =
    (kernelStretchFactorUpperRange - kernelStretchFactorLowerRange) *
      bandwidthsNumerator +
    1

  const [lowerBandwidth, higherBandwidth] = [
    Math.min(bandwidth1, bandwidth2),
    Math.max(bandwidth1, bandwidth2),
  ]
  const bandwidthsToTestLower =
    lowerBandwidth === 0
      ? [{ bandwidth: 0, adjustedBandwidth: 0, factor: 1 } as const]
      : Array.from({ length: optimizationIterations }, (_, i) => {
          const factor =
            kernelStretchFactorLowerRange +
            kernelStretchFactorSearchStepSize * i
          return {
            bandwidth: lowerBandwidth,
            adjustedBandwidth: lowerBandwidth * factor,
            factor,
          } as const
        })
  const bandwidthsToTestHigher =
    higherBandwidth === 0
      ? [{ bandwidth: 0, adjustedBandwidth: 0, factor: 1 } as const]
      : Array.from({ length: optimizationIterations }, (_, i) => {
          const factor =
            kernelStretchFactorLowerRange +
            kernelStretchFactorSearchStepSize * i
          return {
            bandwidth: higherBandwidth,
            adjustedBandwidth: higherBandwidth * factor,
            factor,
          } as const
        })
  const firstHighBandwidthValue =
    bandwidthsToTestHigher[0]?.adjustedBandwidth ?? (0 as const)
  let firstOverlappingLowerBandwidthIndex = bandwidthsToTestLower.findIndex(
    ({ adjustedBandwidth }) => adjustedBandwidth > firstHighBandwidthValue,
  )
  if (firstOverlappingLowerBandwidthIndex === -1) {
    const lastLowBandwidthValue =
      bandwidthsToTestLower.at(-1)?.adjustedBandwidth ?? 0
    const inBetweenDistance = firstHighBandwidthValue - lastLowBandwidthValue
    const averageStepDistance =
      (lowerBandwidth * kernelStretchFactorSearchStepSize +
        higherBandwidth * kernelStretchFactorSearchStepSize) /
      2
    const inBetweenCount = Math.ceil(inBetweenDistance / averageStepDistance)
    const inBetweenBandwidths = Array.from(
      { length: inBetweenCount - 1 },
      (_, i) => {
        const sourceBandwidth =
          // eslint-disable-next-line no-magic-numbers
          i / inBetweenCount < 0.5 ? lowerBandwidth : higherBandwidth
        const adjustedBandwidth =
          lastLowBandwidthValue + averageStepDistance * (i + 1)
        const factor = adjustedBandwidth / sourceBandwidth
        return {
          bandwidth: sourceBandwidth,
          adjustedBandwidth,
          factor,
        } as const
      },
    )
    bandwidthsToTestLower.push(...inBetweenBandwidths)
    firstOverlappingLowerBandwidthIndex = bandwidthsToTestLower.length
  }

  const bandwidthsToTest = [
    ...bandwidthsToTestLower.slice(0, firstOverlappingLowerBandwidthIndex),
    ...bandwidthsToTestHigher,
  ]

  const getSplitsForConfiguration = ({
    shouldSplit1,
    shouldSplit2,
    ...iterationSettings
  }: {
    kernelStretchFactor: number
    bandwidth: number
    threshold: number
    shouldSplit1?: boolean
    shouldSplit2?: boolean
  }): readonly [GetSplitsReturnType, GetSplitsReturnType] => {
    const common = {
      ...iterationSettings,
      noiseValuesPerSample,
      iterations,
      random,
    }
    const split1 =
      !shouldSplit1 || common.bandwidth === 0
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
        : getSplitsWithKDE({
            ...common,
            sortedData: sorted1,
          })
    const split2 =
      !shouldSplit2 || common.bandwidth === 0
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
        : getSplitsWithKDE({
            ...common,
            sortedData: sorted2,
          })
    return [split1, split2] as const
  }

  // try out different kernelStretchFactors automatically to find the best one
  // optimizing for lowest pooled stdev difference
  const bestComparisons = optimize({
    iterate: getSplitsForConfiguration,
    getNextIterationArgument(iteration) {
      // we want 3 iterations per bandwidth: split vs split, split vs unsplit, unsplit vs split
      const bandwidthIndex = Math.floor(iteration / 3)
      const shouldSplit1 = iteration % 3 === 0 || iteration % 3 === 1
      const shouldSplit2 = iteration % 3 === 0 || iteration % 3 === 2
      const config = bandwidthsToTest[bandwidthIndex]
      if (!config) {
        // we also include an unsplit version to compare against
        return {
          bandwidth: 0,
          threshold: 0,
          kernelStretchFactor: 1,
          shouldSplit1: false,
          shouldSplit2: false,
        }
      }
      const { bandwidth, factor } = config
      const sourceBandwidth = bandwidth === lowerBandwidth ? 'lower' : 'higher'
      // go up in increments of e.g. 0.1 every other iteration
      return {
        kernelStretchFactor: factor,
        bandwidth:
          sourceBandwidth === 'higher' ? higherBandwidth : lowerBandwidth,
        threshold:
          sourceBandwidth === 'higher'
            ? higherBandwidth === bandwidth1
              ? threshold1.value
              : threshold2.value
            : higherBandwidth === bandwidth1
            ? threshold2.value
            : threshold1.value,
        shouldSplit1,
        shouldSplit2,
      } as const
    },
    // we want 3 iterations per bandwidth: split vs split, split vs unsplit, unsplit vs split
    // we add +1 because we also include an unsplit version to compare against
    iterations: bandwidthsToTest.length * 3 + 1,
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
