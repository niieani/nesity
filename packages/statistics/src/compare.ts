/* eslint-disable unicorn/prefer-native-coercion-functions */
import ttest2 from '@stdlib/stats-ttest2'
import { calcCL, calcCohensD, calcGaussOverlap, calcU3 } from './cohensd'
import type { GetSplitsReturnType } from './getSplits'
import { getSplits } from './getSplits'
import {
  calculateSilvermansRuleOfThumbBandwidth,
  optimalThreshold,
  OptimalThresholdConfigBase,
} from './kernelDensityEstimate'
import { getMatchedUsableModalities } from './matchModalities'
import { calcShapiroWilk } from './normality'
import { INVALID_LEFT, INVALID_RIGHT, optimize } from './optimize'
import type { SplitMultiModalDistributionConfig } from './splitMultimodalDistribution'
import * as utils from './utilities'

export interface AllTTests {
  twoSided: TTestResult
  greater: TTestResult
  less: TTestResult
  degreesOfFreedom: number
  tValue: number
}

export interface ComparisonResult {
  outcome: ComparisonOutcome
  outcomeFrequencies?: {
    [outcome in ComparisonOutcome]?: number
  }
  ttest: AllTTests
  ttestAdjusted?: {
    twoSided: TTestResultBase
    greater: TTestResultBase
    less: TTestResultBase
  }
  meanDifference: number
  stdevDifference: number
  pooledVariance: number
  pooledStDev: number
  data1: SampleStatistics
  data2: SampleStatistics
  // present when denoising:
  originalResult?: ComparisonResult
  denoiseSettings?: DenoiseSettings
  effectSize?: {
    cohensD: number
    overlappingCoefficient: number
    probabilityOfSuperiority: number
    nonOverlapMeasure: number
  }
  // present when multimodal
  comparedModalities1?: SampleStatistics[]
  comparedModalities2?: SampleStatistics[]
  discardedModalities1?: number[][]
  discardedModalities2?: number[][]
  mergedFromMultipleModalities?: boolean
}

export type ConfidenceInterval = readonly [number | null, number | null]

// eslint-disable-next-line no-magic-numbers
export const DEFAULT_KERNEL_STRETCH_FACTOR_RANGE = [0.8, 2.5] as const
export const DEFAULT_KERNEL_STRETCH_FACTOR_SEARCH_STEP_SIZE = 0.1
export const DEFAULT_MINIMAL_MODALITY_SIZE = 3
export const DEFAULT_MINIMUM_USED_TO_TOTAL_SAMPLES_RATIO = 0.6
export const DEFAULT_STDEV_DIFF_PENALTY_FACTOR = 1
export const DEFAULT_DISCARDED_DATA_PENALTY_FACTOR = 0.5
export const DEFAULT_HIGH_POOLED_STDEV_PENALTY_FACTOR = 1
export const DEFAULT_HIGH_MEAN_DISTANCE_RATIO_PENALTY_FACTOR = 1
export const DEFAULT_NOISE_SIZE_BONUS_FACTOR = 0.2
export const DEFAULT_OUTCOME_FREQUENCY_PVALUE_ADJUSTMENT_FACTOR = 0.5

export const DEFAULT_CONFIDENCE_LEVEL = 0.95
export const DEFAULT_MODALITY_SPLIT_TO_NOISE_RATIO = 0.8

function getCohensDStats({
  mean1,
  mean2,
  pooledStDev,
  data1,
  data2,
}: {
  mean1: number
  mean2: number
  pooledStDev: number
  data1: number[]
  data2: number[]
}) {
  const cohensD = calcCohensD({ mean1, mean2, pooledStDev, data1, data2 })
  const overlappingCoefficient = calcGaussOverlap(cohensD)
  const probabilityOfSuperiority = calcCL(cohensD)
  const nonOverlapMeasure = calcU3(cohensD)
  return {
    cohensD,
    overlappingCoefficient,
    probabilityOfSuperiority,
    nonOverlapMeasure,
  }
}

export interface SampleStatistics {
  mean: number
  variance: number
  stdev: number
  /** mean distance from consecutive ordered */
  meanDistanceRatio: number
  normalityProbability: number
  dataCount: number
  data: number[]
  discardedCount: number
  discardedData: number[]
  noiseCount?: number
  modalityCount?: number
}

interface TTestResultBase {
  pValue: number
  rejected: boolean
}

export interface TTestResult extends TTestResultBase {
  rejected: boolean
  pValue: number
  confidenceInterval: ConfidenceInterval
}

export interface DenoiseSettings {
  kernelStretchFactor: number
  bandwidth: number
  threshold: number
}

export type ComparisonOutcome =
  | 'less'
  | 'greater'
  | 'equal'
  | 'similar'
  | 'invalid'

export function getOutcome(
  {
    twoSided,
    greater,
    less,
  }: {
    twoSided: TTestResultBase
    greater: TTestResultBase
    less: TTestResultBase
  },
  {
    data1,
    data2,
    meanDifference,
  }: {
    data1: number[]
    data2: number[]
    meanDifference: number
  },
): { outcome: ComparisonOutcome; definitive: boolean } {
  const data1IsEqual = data1.every((d) => d === data1[0])
  const data2IsEqual = data2.every((d) => d === data2[0])
  const isSimpleComparison =
    (data1.length === 1 && data2.length === 1) || (data1IsEqual && data2IsEqual)
  if (isSimpleComparison) {
    return {
      outcome:
        meanDifference === 0
          ? 'equal'
          : meanDifference > 0
          ? 'greater'
          : 'less',
      definitive: true,
    }
  }

  const isTTestInvalid =
    Number.isNaN(twoSided.pValue) ||
    Number.isNaN(greater.pValue) ||
    Number.isNaN(less.pValue)

  const bothAreExactlyEqual =
    meanDifference === 0 &&
    data1IsEqual &&
    data2IsEqual &&
    data1[0] === data2[0]

  // hypothesis: Actual difference in means is not equal to 0
  const outcome = bothAreExactlyEqual
    ? 'equal'
    : isTTestInvalid
    ? 'invalid'
    : // first is greater than second
    greater.rejected
    ? 'less'
    : // first is less than second
    less.rejected
    ? 'greater'
    : 'similar'

  return { outcome, definitive: isTTestInvalid || bothAreExactlyEqual }
}

const getIsUsableModality =
  (minimalSplitLength = DEFAULT_MINIMAL_MODALITY_SIZE) =>
  (
    split: [number[] | undefined, number[] | undefined],
  ): split is [number[], number[]] =>
    Boolean(
      split[0] &&
        split[1] &&
        split[0].length >= minimalSplitLength &&
        split[1].length >= minimalSplitLength,
    )

export const mergeComparisonsFromMultipleModalities = ({
  comparisons,
  confidenceLevel = DEFAULT_CONFIDENCE_LEVEL,
  minimalModalitySize = DEFAULT_MINIMAL_MODALITY_SIZE,
  discardedModalities1,
  discardedModalities2,
}: {
  comparisons: ComparisonResult[]
  confidenceLevel?: number
  minimalModalitySize?: number
  discardedModalities1: number[][]
  discardedModalities2: number[][]
}): ComparisonResult => {
  if (comparisons.length === 0) {
    throw new Error('No comparisons to merge')
  }
  const discardedData1 = discardedModalities1.flat()
  const discardedData2 = discardedModalities2.flat()

  const noise1 = discardedModalities1
    .filter((d) => d.length < minimalModalitySize)
    .flat()
  const noise2 = discardedModalities2
    .filter((d) => d.length < minimalModalitySize)
    .flat()

  const modalityCount1 =
    comparisons.length +
    discardedModalities1.filter((d) => d.length >= minimalModalitySize).length
  const modalityCount2 =
    comparisons.length +
    discardedModalities2.filter((d) => d.length >= minimalModalitySize).length

  if (comparisons.length === 1) {
    return {
      ...comparisons[0]!,
      data1: {
        ...comparisons[0]!.data1,
        discardedCount: discardedData1.length,
        discardedData: discardedData1,
        noiseCount: noise1.length,
      },
      data2: {
        ...comparisons[0]!.data2,
        discardedCount: discardedData2.length,
        discardedData: discardedData2,
        noiseCount: noise2.length,
      },
    }
  }
  const totalData1Length = comparisons.reduce(
    (sum, c) => sum + c.data1.data.length,
    0,
  )
  const totalData2Length = comparisons.reduce(
    (sum, c) => sum + c.data2.data.length,
    0,
  )
  const alpha = 1 - confidenceLevel
  const comparisonsWithWeights = comparisons.map((c) => ({
    ...c,
    weight:
      (c.data1.data.length / totalData1Length +
        c.data2.data.length / totalData2Length) /
      2,
    weight1: c.data1.data.length / totalData1Length,
    weight2: c.data2.data.length / totalData2Length,
  }))
  const weightedMeanDifference = comparisonsWithWeights.reduce(
    (sum, c) => sum + c.meanDifference * c.weight,
    0,
  )
  const weightedPooledVariance = comparisonsWithWeights.reduce(
    (sum, c) => sum + c.pooledVariance * c.weight,
    0,
  )
  const weightedPooledStDev = Math.sqrt(weightedPooledVariance)
  const weightedTValue = comparisonsWithWeights.reduce(
    (sum, c) => sum + c.ttest.tValue * c.weight,
    0,
  )
  const weightedDegreesOfFreedom = comparisonsWithWeights.reduce(
    (sum, c) => sum + c.ttest.degreesOfFreedom * c.weight,
    0,
  )
  function mergeTTest(type: 'twoSided' | 'greater' | 'less'): TTestResult {
    const weightedTwoSidedPValue = comparisonsWithWeights.reduce(
      (sum, c) => sum + c.ttest[type].pValue * c.weight,
      0,
    )
    return {
      pValue: weightedTwoSidedPValue,
      rejected: weightedTwoSidedPValue < alpha,
      confidenceInterval: [
        comparisonsWithWeights.reduce<number | null>((sum, c) => {
          const ci = c.ttest[type].confidenceInterval
          return ci[0] === null ? sum : (sum ?? 0) + ci[0] * c.weight
        }, null),
        comparisonsWithWeights.reduce<number | null>((sum, c) => {
          const ci = c.ttest[type].confidenceInterval
          return ci[1] === null ? sum : (sum ?? 0) + ci[1] * c.weight
        }, null),
      ] as const,
    }
  }

  const ttest = {
    twoSided: mergeTTest('twoSided'),
    greater: mergeTTest('greater'),
    less: mergeTTest('less'),
    degreesOfFreedom: weightedDegreesOfFreedom,
    tValue: weightedTValue,
  }

  const allUsedData1 = comparisonsWithWeights.flatMap((c) => c.data1.data)
  const allUsedData2 = comparisonsWithWeights.flatMap((c) => c.data2.data)
  const { outcome } = getOutcome(ttest, {
    data1: allUsedData1,
    data2: allUsedData2,
    meanDifference: weightedMeanDifference,
  })

  const largestSampleSplitComparison = comparisonsWithWeights
    .reverse()
    .sort((a, b) => b.weight - a.weight)[0]!

  const stdev1 = comparisonsWithWeights.reduce(
    (sum, c) => sum + c.data1.stdev * c.weight1,
    0,
  )
  const stdev2 = comparisonsWithWeights.reduce(
    (sum, c) => sum + c.data2.stdev * c.weight2,
    0,
  )
  return {
    outcome,
    ttest,
    meanDifference: weightedMeanDifference,
    stdevDifference: stdev1 - stdev2,
    pooledVariance: weightedPooledVariance,
    pooledStDev: weightedPooledStDev,
    data1: {
      data: allUsedData1,
      // we don't weight the mean, because it would be even more misleading
      // we use the largest sample split instead
      mean: largestSampleSplitComparison.data1.mean,
      stdev: stdev1,
      discardedCount: discardedData1.length,
      discardedData: discardedData1,
      meanDistanceRatio: comparisonsWithWeights.reduce(
        (sum, c) => sum + c.data1.meanDistanceRatio * c.weight1,
        0,
      ),
      normalityProbability: comparisonsWithWeights.reduce(
        (sum, c) => sum + c.data1.normalityProbability * c.weight1,
        0,
      ),
      dataCount: allUsedData1.length,
      variance: comparisonsWithWeights.reduce(
        (sum, c) => sum + c.data1.variance * c.weight1,
        0,
      ),
      modalityCount: modalityCount1,
    },
    data2: {
      data: allUsedData2,
      dataCount: allUsedData2.length,
      discardedCount: discardedData2.length,
      discardedData: discardedData2,
      mean: largestSampleSplitComparison.data2.mean,
      stdev: stdev2,
      meanDistanceRatio: comparisonsWithWeights.reduce(
        (sum, c) => sum + c.data2.meanDistanceRatio * c.weight2,
        0,
      ),
      normalityProbability: comparisonsWithWeights.reduce(
        (sum, c) => sum + c.data2.normalityProbability * c.weight2,
        0,
      ),
      variance: comparisonsWithWeights.reduce(
        (sum, c) => sum + c.data2.variance * c.weight2,
        0,
      ),
      modalityCount: modalityCount2,
    },
    comparedModalities1: comparisonsWithWeights.map((c) => c.data1),
    comparedModalities2: comparisonsWithWeights.map((c) => c.data2),
    discardedModalities1,
    discardedModalities2,
    mergedFromMultipleModalities: true,
  }
}

export function compare({
  data1,
  data2,
  discardedData1,
  discardedData2,
  minimumVelocityToFirstQuartileRatio,
  precisionDelta,
  noiseValuesPerSample = 0,
  random,
  kernelStretchFactorRange: [
    kernelStretchFactorLowerRange,
    kernelStretchFactorUpperRange,
  ] = DEFAULT_KERNEL_STRETCH_FACTOR_RANGE,
  confidenceLevel = DEFAULT_CONFIDENCE_LEVEL,
  iterations,
  kernelStretchFactorSearchStepSize = DEFAULT_KERNEL_STRETCH_FACTOR_SEARCH_STEP_SIZE,
  minimalModalitySize = DEFAULT_MINIMAL_MODALITY_SIZE,
  minimumUsedToTotalSamplesRatio = DEFAULT_MINIMUM_USED_TO_TOTAL_SAMPLES_RATIO,
  stdevDiffPenaltyFactor = DEFAULT_STDEV_DIFF_PENALTY_FACTOR,
  discardedDataPenaltyFactor = DEFAULT_DISCARDED_DATA_PENALTY_FACTOR,
  highPooledStdevPenaltyFactor = DEFAULT_HIGH_POOLED_STDEV_PENALTY_FACTOR,
  highMeanDistanceRatioPenaltyFactor = DEFAULT_HIGH_MEAN_DISTANCE_RATIO_PENALTY_FACTOR,
  noiseSizeBonusFactor = DEFAULT_NOISE_SIZE_BONUS_FACTOR,
  outcomeFrequencyPValueAdjustmentFactor = DEFAULT_OUTCOME_FREQUENCY_PVALUE_ADJUSTMENT_FACTOR,
}: {
  data1: number[]
  data2: number[]
  discardedData1?: number[]
  discardedData2?: number[]
  confidenceLevel?: number
  kernelStretchFactorRange?: readonly [lower: number, upper: number]
  kernelStretchFactorSearchStepSize?: number
  minimalModalitySize?: number
  minimumUsedToTotalSamplesRatio?: number
  stdevDiffPenaltyFactor?: number
  discardedDataPenaltyFactor?: number
  highPooledStdevPenaltyFactor?: number
  highMeanDistanceRatioPenaltyFactor?: number
  noiseSizeBonusFactor?: number
  outcomeFrequencyPValueAdjustmentFactor?: number
} & OptimalThresholdConfigBase &
  Pick<
    SplitMultiModalDistributionConfig,
    'noiseValuesPerSample' | 'random' | 'iterations'
  >): ComparisonResult {
  const [sorted1, sorted2] = [utils.sort(data1), utils.sort(data2)]
  const [mean1, mean2] = [utils.mean(data1), utils.mean(data2)]
  const [meanDistanceRatio1, meanDistanceRatio2] = [
    utils.mean(utils.consecutiveRatios(sorted1)),
    utils.mean(utils.consecutiveRatios(sorted2)),
  ]
  const [variance1, variance2] = [
    utils.variance({
      sortedData: sorted1,
      mean: mean1,
      besselsCorrection: true,
    }),
    utils.variance({
      sortedData: sorted2,
      mean: mean2,
      besselsCorrection: true,
    }),
  ]
  const [stdev1, stdev2] = [
    utils.stdev({ sortedData: sorted1, variance: variance1 }),
    utils.stdev({ sortedData: sorted2, variance: variance2 }),
  ]

  // TODO: potentially add Kolmogorov Smirnov test
  const [shapiroWilk1, shapiroWilk2] = [
    calcShapiroWilk(data1),
    calcShapiroWilk(data2),
  ]
  const pooledVariance = utils.pooledVariance({
    data1,
    variance1,
    data2,
    variance2,
  })
  const pooledStDev = Math.sqrt(pooledVariance)
  const meanDifference = mean2 - mean1

  const alpha = 1 - confidenceLevel
  const [twoSided, greater, less] = [
    ttest2(data1, data2, {
      alternative: 'two-sided',
      alpha,
    }),
    ttest2(data1, data2, {
      alternative: 'greater',
      alpha,
    }),
    ttest2(data1, data2, {
      alternative: 'less',
      alpha,
    }),
  ]

  const { outcome, definitive: definitiveOutcomeEstablished } = getOutcome(
    { twoSided, greater, less },
    { meanDifference, data1, data2 },
  )

  let result: ComparisonResult = {
    outcome,
    meanDifference,
    stdevDifference: stdev1 - stdev2,
    pooledVariance,
    pooledStDev,
    ttest: {
      // how many standard deviations away from the mean of the distribution:
      tValue: twoSided.statistic,
      degreesOfFreedom: twoSided.df,
      twoSided: {
        rejected: definitiveOutcomeEstablished
          ? outcome === 'greater' || outcome === 'less'
          : twoSided.rejected,
        pValue: definitiveOutcomeEstablished
          ? outcome === 'greater' || outcome === 'less'
            ? 0
            : 1
          : twoSided.pValue,
        confidenceInterval: [twoSided.ci[0] ?? null, twoSided.ci[1] ?? null],
      },
      greater: {
        rejected: definitiveOutcomeEstablished
          ? outcome === 'greater'
          : greater.rejected,
        pValue: definitiveOutcomeEstablished
          ? outcome === 'greater'
            ? 0
            : 1
          : greater.pValue,
        confidenceInterval: [greater.ci[0] ?? null, greater.ci[1] ?? null],
      },
      less: {
        rejected: definitiveOutcomeEstablished
          ? outcome === 'less'
          : less.rejected,
        pValue: definitiveOutcomeEstablished
          ? outcome === 'less'
            ? 0
            : 1
          : less.pValue,
        confidenceInterval: [less.ci[0] ?? null, less.ci[1] ?? null],
      },
    },
    data1: {
      mean: mean1,
      stdev: stdev1,
      variance: variance1,
      meanDistanceRatio: meanDistanceRatio1,
      normalityProbability:
        Number.isNaN(shapiroWilk1.pValue) || shapiroWilk1.pValue < 0
          ? 1
          : Math.max(1 - shapiroWilk1.pValue, 0),
      dataCount: data1.length,
      discardedCount: discardedData1?.length ?? 0,
      discardedData: discardedData1 ?? [],
      data: sorted1,
    },
    data2: {
      mean: mean2,
      stdev: stdev2,
      variance: variance2,
      meanDistanceRatio: meanDistanceRatio2,
      normalityProbability:
        Number.isNaN(shapiroWilk2.pValue) || shapiroWilk2.pValue < 0
          ? 0
          : Math.max(1 - shapiroWilk2.pValue, 0),
      dataCount: data2.length,
      discardedCount: discardedData2?.length ?? 0,
      discardedData: discardedData2 ?? [],
      data: sorted2,
    },
  } as const

  if (
    !(
      noiseValuesPerSample === 0 ||
      definitiveOutcomeEstablished ||
      data1.length <= 2 ||
      data2.length <= 2
    )
  ) {
    // apply denoising logic:
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

    const kernelStretchOptimization = ({
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
          : getSplits({
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
          : getSplits({
              ...common,
              sortedData: sorted2,
            })
      return [split1, split2] as const
    }

    // try out different kernelStretchFactors automatically to find the best one
    // optimizing for lowest pooled stdev difference
    const bestComparisons = optimize({
      iterate: kernelStretchOptimization,
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
        const sourceBandwidth =
          bandwidth === lowerBandwidth ? 'lower' : 'higher'
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
        const isUsableModality = getIsUsableModality(minimalModalitySize)
        const comparisons = allResults.map(([, [split1, split2]]) => {
          const { usableModalities, discardedModalities } =
            getMatchedUsableModalities({
              rawSplits1: split1.rawSplits,
              rawSplits2: split2.rawSplits,
              isUsableModality,
            })

          if (usableModalities.length === 0) {
            return undefined
          }
          const [discardedModalities1, discardedModalities2] = [
            discardedModalities
              .map(([rd1]) => rd1)
              .filter((arr): arr is number[] => Boolean(arr)),
            discardedModalities
              .map(([, rd2]) => rd2)
              .filter((arr): arr is number[] => Boolean(arr)),
          ]
          const modalityComparisons = usableModalities.map(([d1, d2]) =>
            compare({
              data1: d1,
              data2: d2,
              confidenceLevel,
              precisionDelta,
            }),
          )
          const comparison = mergeComparisonsFromMultipleModalities({
            comparisons: modalityComparisons,
            confidenceLevel,
            discardedModalities1,
            discardedModalities2,
          })
          if (
            comparison.data1.dataCount / data1.length <
              minimumUsedToTotalSamplesRatio ||
            comparison.data2.dataCount / data2.length <
              minimumUsedToTotalSamplesRatio
          ) {
            return undefined
          }
          return comparison
        })
        const validComparisons = comparisons.filter(
          (c): c is ComparisonResult => Boolean(c),
        )
        return {
          comparisons,
          maxPooledStdev: Math.max(
            ...validComparisons.map((comparison) => comparison.pooledStDev),
          ),
          maxStdevDifference: Math.max(
            ...validComparisons.map((comparison) =>
              Math.abs(comparison.stdevDifference),
            ),
          ),
          maxNoiseCount1: Math.max(
            ...validComparisons.map(
              (comparison) => comparison.data1.noiseCount ?? 0,
            ),
          ),
          maxNoiseCount2: Math.max(
            ...validComparisons.map(
              (comparison) => comparison.data2.noiseCount ?? 0,
            ),
          ),
          maxMeanDistance1: Math.max(
            ...validComparisons.map(
              (comparison) => comparison.data1.meanDistanceRatio,
            ),
          ),
          maxMeanDistance2: Math.max(
            ...validComparisons.map(
              (comparison) => comparison.data2.meanDistanceRatio,
            ),
          ),
          maxDiscardedCount1: Math.max(
            ...validComparisons.map(
              (comparison) => comparison.data1.discardedCount,
            ),
          ),
          maxDiscardedCount2: Math.max(
            ...validComparisons.map(
              (comparison) => comparison.data2.discardedCount,
            ),
          ),
        }
      },
      compare: (_splitsA, _splitsB, indexA, indexB, cache) => {
        const comparisonA = cache?.comparisons[indexA]
        const comparisonB = cache?.comparisons[indexB]

        if (!comparisonA) {
          return INVALID_LEFT
        }
        if (!comparisonB) {
          return INVALID_RIGHT
        }

        // discarded data
        const discardedDataPenaltyA1 =
          cache.maxDiscardedCount1 === 0
            ? 0
            : comparisonA.data1.discardedCount / cache.maxDiscardedCount1
        const discardedDataPenaltyA2 =
          cache.maxDiscardedCount1 === 0
            ? 0
            : comparisonA.data2.discardedCount / cache.maxDiscardedCount2
        const discardedDataPenaltyB1 =
          cache.maxDiscardedCount1 === 0
            ? 0
            : comparisonB.data1.discardedCount / cache.maxDiscardedCount1
        const discardedDataPenaltyB2 =
          cache.maxDiscardedCount2 === 0
            ? 0
            : comparisonB.data2.discardedCount / cache.maxDiscardedCount2

        // we add points for noise size, non-modalities that were filtered out
        const noiseSizeBonusA1 =
          cache.maxNoiseCount1 === 0
            ? 0
            : (comparisonA.data1.noiseCount ?? 0) / cache.maxNoiseCount1
        const noiseSizeBonusA2 =
          cache.maxNoiseCount2 === 0
            ? 0
            : (comparisonA.data2.noiseCount ?? 0) / cache.maxNoiseCount2
        const noiseSizeBonusB1 =
          cache.maxNoiseCount1 === 0
            ? 0
            : (comparisonB.data1.noiseCount ?? 0) / cache.maxNoiseCount1
        const noiseSizeBonusB2 =
          cache.maxNoiseCount2 === 0
            ? 0
            : (comparisonB.data2.noiseCount ?? 0) / cache.maxNoiseCount2

        // penalty for larger distances
        const meanDistanceRatioPenaltyA1 =
          cache.maxMeanDistance1 === 0
            ? 0
            : comparisonA.data1.meanDistanceRatio / cache.maxMeanDistance1
        const meanDistanceRatioPenaltyA2 =
          cache.maxMeanDistance2 === 0
            ? 0
            : comparisonA.data2.meanDistanceRatio / cache.maxMeanDistance2
        const meanDistanceRatioPenaltyB1 =
          cache.maxMeanDistance1 === 0
            ? 0
            : comparisonB.data1.meanDistanceRatio / cache.maxMeanDistance1
        const meanDistanceRatioPenaltyB2 =
          cache.maxMeanDistance2 === 0
            ? 0
            : comparisonB.data2.meanDistanceRatio / cache.maxMeanDistance2

        // stdev difference
        const stdevDiffPenaltyA =
          cache.maxStdevDifference === 0
            ? 0
            : Math.abs(comparisonA.stdevDifference) / cache.maxStdevDifference
        const stdevDiffPenaltyB =
          cache.maxStdevDifference === 0
            ? 0
            : Math.abs(comparisonB.stdevDifference) / cache.maxStdevDifference

        // pooled stdev
        const pooledStdevPenaltyA =
          cache.maxPooledStdev === 0
            ? 0
            : Math.abs(comparisonA.pooledStDev) / cache.maxPooledStdev
        const pooledStdevPenaltyB =
          cache.maxPooledStdev === 0
            ? 0
            : Math.abs(comparisonB.pooledStDev) / cache.maxPooledStdev

        const overallDiscardedDataPenaltyA =
          (discardedDataPenaltyA1 + discardedDataPenaltyA2) / 2
        const overallDiscardedDataPenaltyB =
          (discardedDataPenaltyB1 + discardedDataPenaltyB2) / 2

        const overallMeanDistancePenaltyA =
          (meanDistanceRatioPenaltyA1 + meanDistanceRatioPenaltyA2) / 2
        const overallMeanDistancePenaltyB =
          (meanDistanceRatioPenaltyB1 + meanDistanceRatioPenaltyB2) / 2

        const overallNoiseSizeBonusA = (noiseSizeBonusA1 + noiseSizeBonusA2) / 2
        const overallNoiseSizeBonusB = (noiseSizeBonusB1 + noiseSizeBonusB2) / 2

        // to get as high quality data as we can by matching samples together
        // we want to keep as much data as possible (penalty for discarding more data),
        // but also minimize the differences between stdevs (penalty for higher stdev difference),
        // and increase the amount of noise removed (bonus for removing more noise)
        const valueA =
          stdevDiffPenaltyA * stdevDiffPenaltyFactor +
          overallDiscardedDataPenaltyA * discardedDataPenaltyFactor +
          pooledStdevPenaltyA * highPooledStdevPenaltyFactor +
          overallMeanDistancePenaltyA * highMeanDistanceRatioPenaltyFactor +
          overallNoiseSizeBonusA * -noiseSizeBonusFactor
        const valueB =
          stdevDiffPenaltyB * stdevDiffPenaltyFactor +
          overallDiscardedDataPenaltyB * discardedDataPenaltyFactor +
          pooledStdevPenaltyB * highPooledStdevPenaltyFactor +
          overallMeanDistancePenaltyB * highMeanDistanceRatioPenaltyFactor +
          overallNoiseSizeBonusB * -noiseSizeBonusFactor
        // the more similar the stdevDifference and pooledStDev between the two, the better

        return [
          valueA - valueB,
          // return lower first -- it will be one representing the ranking
          valueA < valueB ? comparisonA : comparisonB,
        ]
      },
      reverseCompareMeta: (comparisons) => comparisons,
    })

    // we want to count the number of times the comparison was similar/greater/less,
    // and choose the best one from those
    // 'similar' and 'equal' are counted as the same thing for this purpose
    const outcomeByFrequency = utils
      .histogramBy(bestComparisons, ([_settings, _split, comparison]) =>
        comparison.outcome === 'equal' ? 'similar' : comparison.outcome,
      )
      .sort(([, a], [, b]) => b - a)

    const outcomeFrequenciesArray = outcomeByFrequency.map(
      ([[[_settings, _split, comparison] = []], count]) =>
        [comparison!.outcome, count / bestComparisons.length] as const,
    )

    const outcomeFrequencies = Object.fromEntries(outcomeFrequenciesArray) as {
      [outcome in ComparisonOutcome]?: number
    }

    const bestComparisonsFromMostCommonOutcome = outcomeByFrequency[0]?.[0]

    const [
      denoiseSettings,
      [splitMetadata1, splitMetadata2],
      betterComparison,
    ] = bestComparisonsFromMostCommonOutcome?.[0] ?? [undefined, [], undefined]

    // note: in some cases it might be better to use the original result,
    // e.g. if Math.abs(result.stdevDifference) < Math.abs(betterBand.stdevDifference)
    if (betterComparison) {
      const mostCommon = outcomeFrequenciesArray[0]?.[0]
      const twoSidedAdjustment = outcomeFrequencies.similar
        ? 1 -
          (1 - outcomeFrequencies.similar) *
            outcomeFrequencyPValueAdjustmentFactor
        : 1
      const greaterAdjustment = outcomeFrequencies.greater
        ? 1 -
          (1 - outcomeFrequencies.greater) *
            outcomeFrequencyPValueAdjustmentFactor
        : 1
      const lessAdjustment = outcomeFrequencies.less
        ? 1 -
          (1 - outcomeFrequencies.less) * outcomeFrequencyPValueAdjustmentFactor
        : 1
      // most common adjust up
      // less common adjust down
      const twoSidedPValue =
        mostCommon === 'similar'
          ? 1 -
            (1 - betterComparison.ttest.twoSided.pValue) * twoSidedAdjustment
          : betterComparison.ttest.twoSided.pValue * twoSidedAdjustment
      const greaterPValue =
        mostCommon === 'greater'
          ? 1 - (1 - betterComparison.ttest.greater.pValue) * greaterAdjustment
          : betterComparison.ttest.greater.pValue * greaterAdjustment
      const lessPValue =
        mostCommon === 'less'
          ? 1 - (1 - betterComparison.ttest.less.pValue) * lessAdjustment
          : betterComparison.ttest.less.pValue * lessAdjustment
      const ttestAdjusted = {
        twoSided: {
          pValue: twoSidedPValue,
          rejected: twoSidedPValue < alpha,
        },
        greater: {
          pValue: greaterPValue,
          rejected: greaterPValue < alpha,
        },
        less: {
          pValue: lessPValue,
          rejected: lessPValue < alpha,
        },
      }
      result = {
        ...betterComparison,
        ...(outcomeFrequenciesArray.length > 1
          ? {
              ttestAdjusted,
              outcome: getOutcome(ttestAdjusted, {
                data1: betterComparison.data1.data,
                data2: betterComparison.data2.data,
                meanDifference: betterComparison.meanDifference,
              }).outcome,
              outcomeFrequencies,
            }
          : {}),
        originalResult: result,
        denoiseSettings,
      }
    }
    result.data1.modalityCount =
      result.data1.modalityCount ?? splitMetadata1?.modalityCount ?? 1
    result.data2.modalityCount =
      result.data2.modalityCount ?? splitMetadata2?.modalityCount ?? 1
  }

  return {
    ...result,
    // Calculate the effect size using Cohen's d;
    // this is delayed to the last moment for performance
    effectSize: getCohensDStats({
      mean1: result.data1.mean,
      mean2: result.data2.mean,
      pooledStDev: result.pooledStDev,
      data1: result.data1.data,
      data2: result.data2.data,
    }),
  }
}
