/* eslint-disable unicorn/prefer-native-coercion-functions */
import ttest2 from '@stdlib/stats-ttest2'
import { calcCL, calcCohensD, calcGaussOverlap, calcU3 } from './cohensd'
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
  normalityProbability: number
  dataCount: number
  data: number[]
  discardedCount: number
  discardedData: number[]
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

export interface ComparisonResult {
  outcome: ComparisonOutcome
  ttest: {
    twoSided: TTestResult
    greater: TTestResult
    less: TTestResult
    degreesOfFreedom: number
    tValue: number
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
const DEFAULT_KERNEL_STRETCH_FACTOR_RANGE = [0.8, 2.5] as const
const MINIMAL_MULTI_THRESHOLD_TESTING_THRESHOLD_DIFFERENCE_TO_STDEV_RATIO = 0.5
const DEFAULT_KERNEL_STRETCH_FACTOR_SEARCH_STEP_SIZE = 0.1
const DEFAULT_MINIMAL_MODALITY_SIZE = 3
const DEFAULT_MINIMUM_USED_TO_TOTAL_SAMPLES_RATIO = 0.6
const DEFAULT_DISCARDED_DATA_PENALTY_FACTOR = 0.3

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
  discardedModalities1,
  discardedModalities2,
}: {
  comparisons: ComparisonResult[]
  confidenceLevel?: number
  discardedModalities1: number[][]
  discardedModalities2: number[][]
}): ComparisonResult => {
  if (comparisons.length === 0) {
    throw new Error('No comparisons to merge')
  }
  const discardedData1 = discardedModalities1.flat()
  const discardedData2 = discardedModalities2.flat()

  if (comparisons.length === 1) {
    return {
      ...comparisons[0]!,
      data1: {
        ...comparisons[0]!.data1,
        discardedCount: discardedData1.length,
        discardedData: discardedData1,
      },
      data2: {
        ...comparisons[0]!.data2,
        discardedCount: discardedData2.length,
        discardedData: discardedData2,
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
      normalityProbability: comparisonsWithWeights.reduce(
        (sum, c) => sum + c.data1.normalityProbability * c.weight1,
        0,
      ),
      dataCount: allUsedData1.length,
      variance: comparisonsWithWeights.reduce(
        (sum, c) => sum + c.data1.variance * c.weight1,
        0,
      ),
    },
    data2: {
      data: allUsedData2,
      dataCount: allUsedData2.length,
      discardedCount: discardedData2.length,
      discardedData: discardedData2,
      mean: largestSampleSplitComparison.data2.mean,
      stdev: stdev2,
      normalityProbability: comparisonsWithWeights.reduce(
        (sum, c) => sum + c.data2.normalityProbability * c.weight2,
        0,
      ),
      variance: comparisonsWithWeights.reduce(
        (sum, c) => sum + c.data2.variance * c.weight2,
        0,
      ),
    },
    comparedModalities1: comparisons.map((c) => c.data1),
    comparedModalities2: comparisons.map((c) => c.data2),
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
  discardedDataPenaltyFactor = DEFAULT_DISCARDED_DATA_PENALTY_FACTOR,
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
  discardedDataPenaltyFactor?: number
} & OptimalThresholdConfigBase &
  Pick<
    SplitMultiModalDistributionConfig,
    'noiseValuesPerSample' | 'random' | 'iterations'
  >): ComparisonResult {
  const [sorted1, sorted2] = [utils.sort(data1), utils.sort(data2)]
  const [mean1, mean2] = [utils.mean(data1), utils.mean(data2)]
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

    const thresholdDifference = Math.abs(threshold1.value - threshold2.value)
    const thresholdToStdevRatio = thresholdDifference / pooledStDev
    // little performance optimization
    const itIsWorthTestingBothThresholds =
      thresholdToStdevRatio >
      MINIMAL_MULTI_THRESHOLD_TESTING_THRESHOLD_DIFFERENCE_TO_STDEV_RATIO

    const kernelStretchOptimization = (iterationSettings: {
      kernelStretchFactor: number
      bandwidth: number
      threshold: number
    }) => {
      const common = {
        ...iterationSettings,
        noiseValuesPerSample,
        iterations,
        random,
      }
      return [
        getSplits({
          ...common,
          sortedData: sorted1,
        }),
        getSplits({
          ...common,
          sortedData: sorted2,
        }),
      ] as const
    }

    const numerator = 1 / kernelStretchFactorSearchStepSize
    const optimizationIterations =
      (kernelStretchFactorUpperRange - kernelStretchFactorLowerRange) *
      numerator

    // try out different kernelStretchFactors automatically to find the best one
    // optimizing for lowest pooled stdev difference
    const bestComparisons = optimize({
      iterate: kernelStretchOptimization,
      getNextIterationArgument(iteration) {
        const actualIteration = itIsWorthTestingBothThresholds
          ? Math.floor(iteration / 2)
          : iteration
        // go up in increments of e.g. 0.1 every other iteration
        const kernelStretchFactorAdjustment = actualIteration / numerator
        return {
          kernelStretchFactor:
            kernelStretchFactorLowerRange + kernelStretchFactorAdjustment,
          bandwidth: itIsWorthTestingBothThresholds
            ? iteration % 2 === 0
              ? bandwidth1
              : bandwidth2
            : Math.min(bandwidth1, bandwidth2),
          threshold: itIsWorthTestingBothThresholds
            ? iteration % 2 === 0
              ? threshold1.value
              : threshold2.value
            : Math.min(threshold1.value, threshold2.value),
        }
      },
      // we have twice as many iteration if we test both bandwidth/threshold pairs
      iterations: itIsWorthTestingBothThresholds
        ? optimizationIterations * 2
        : optimizationIterations,
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
          maxStdevDiff: Math.max(
            ...validComparisons.map((comparison) =>
              Math.abs(comparison.stdevDifference),
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
        const stdevDiffPenaltyA =
          cache.maxStdevDiff === 0
            ? 0
            : Math.abs(comparisonA.stdevDifference) / cache.maxStdevDiff
        const stdevDiffPenaltyB =
          cache.maxStdevDiff === 0
            ? 0
            : Math.abs(comparisonB.stdevDifference) / cache.maxStdevDiff
        const overallDiscardedDataPenaltyA =
          (discardedDataPenaltyA1 + discardedDataPenaltyA2) / 2
        const overallDiscardedDataPenaltyB =
          (discardedDataPenaltyB1 + discardedDataPenaltyB2) / 2

        // to get as high quality data as we can by matching samples together
        // we want to keep as much data as possible (penalty for discarding more data),
        // but also minimize the differences between stdevs (penalty for higher stdev difference)
        const valueA =
          stdevDiffPenaltyA +
          overallDiscardedDataPenaltyA * discardedDataPenaltyFactor
        const valueB =
          stdevDiffPenaltyB +
          overallDiscardedDataPenaltyB * discardedDataPenaltyFactor

        // an alternative would be to compare pooledStDev:
        // const valueA = comparisonA.pooledStDev
        // const valueB = comparisonB.pooledStDev
        // the more similar the pooledStDev between the two, the better

        return [
          valueA - valueB,
          // return lower first -- it will be one representing the ranking
          valueA < valueB
            ? ([comparisonA, comparisonB] as const)
            : ([comparisonB, comparisonA] as const),
        ]
      },
      reverseCompareMeta: ([comparisonA, comparisonB]) =>
        [comparisonB, comparisonA] as const,
    })

    // we want to count the number of times the comparison was similar/greater/less,
    // and choose the best one from those
    // 'similar' and 'equal' are counted as the same thing for this purpose
    const bestComparisonsFromMostCommonOutcome = utils.mostCommonBy(
      bestComparisons,
      ([_settings, _split, [comparison]]) =>
        comparison.outcome === 'equal' ? 'similar' : comparison.outcome,
    )

    const [denoiseSettings, [splitMetadata1, splitMetadata2], [betterBand]] =
      bestComparisonsFromMostCommonOutcome[0] ?? [undefined, [], []]

    // note: in some cases it might be better to use the original result,
    // e.g. if Math.abs(result.stdevDifference) < Math.abs(betterBand.stdevDifference)
    if (betterBand) {
      result = {
        ...betterBand,
        originalResult: result,
        denoiseSettings,
      }
    }
    result.data1.modalityCount = splitMetadata1?.modalityCount
    result.data2.modalityCount = splitMetadata2?.modalityCount
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
