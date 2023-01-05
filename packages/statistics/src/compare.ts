import ttest2 from '@stdlib/stats-ttest2'
import { calcCL, calcCohensD, calcGaussOverlap, calcU3 } from './cohensd'
import {
  calculateSilvermansRuleOfThumbBandwidth,
  optimalThreshold,
  OptimalThresholdConfigBase,
} from './kernelDensityEstimate'
import { calcShapiroWilk } from './normality'
import { optimize } from './optimize'
import {
  splitMultimodalDistribution,
  SplitMultiModalDistributionConfig,
} from './splitMultimodalDistribution'
import * as utils from './utilities'

const DEFAULT_CONFIDENCE_LEVEL = 0.95
const DEFAULT_MODALITY_SPLIT_TO_NOISE_RATIO = 0.8

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

function getSplits({
  kernelStretchFactor,
  noiseValuesPerSample,
  random,
  bandwidth,
  threshold,
  sortedData,
  // by default, at least 80% of the data must be in a split to count as a separate modality
  getSeparateModalityThreshold = (splitsCount: number) =>
    (1 / splitsCount) * DEFAULT_MODALITY_SPLIT_TO_NOISE_RATIO,
  iterations,
}: Pick<
  SplitMultiModalDistributionConfig,
  'kernelStretchFactor' | 'noiseValuesPerSample' | 'random' | 'iterations'
> & {
  bandwidth: number
  threshold: number
  sortedData: number[]
  getSeparateModalityThreshold?: (splitsCount: number) => number
}): {
  largestSplit: number[]
  rejectedData: number[]
  splitsSortedBySize: number[][]
  splits: number[][]
  modalityCount: number
} {
  const common: Pick<
    SplitMultiModalDistributionConfig,
    | 'kernelStretchFactor'
    | 'noiseValuesPerSample'
    | 'random'
    | 'getBandwidth'
    | 'getThreshold'
    | 'iterations'
  > = {
    kernelStretchFactor,
    noiseValuesPerSample,
    random,
    getBandwidth: () => bandwidth,
    getThreshold: () => threshold,
    iterations,
  }
  const splits = splitMultimodalDistribution({ sortedData, ...common })
  const splitsSortedBySize = [...splits].sort((a, b) => b.length - a.length)
  const largestSplit = splitsSortedBySize[0] ?? []
  const rejectedData = splitsSortedBySize.slice(1).flat()
  // in order to count as a separate modality,
  // each split must contain at least it's proportionate amount of the data
  const separateModalityThreshold = getSeparateModalityThreshold(splits.length)
  const modalityDistribution = splitsSortedBySize.map(
    (split) => split.length / sortedData.length,
  )
  const modalityCount = modalityDistribution.filter(
    (modality) => modality >= separateModalityThreshold,
  ).length

  return {
    largestSplit,
    rejectedData,
    splitsSortedBySize,
    splits,
    modalityCount,
  }
}

export interface SampleStatistics {
  mean: number
  variance: number
  stdev: number
  normalityProbability: number
  validCount: number
  data: number[]
  rejectedCount: number
  rejectedData: number[]
  modalityCount?: number
}

export interface SingleTTest {
  rejected: boolean
  pValue: number
  confidenceInterval: ConfidenceInterval
}

export interface DenoiseSettings {
  kernelStretchFactor: number
  bandwidth: number
  threshold: number
}

export interface ComparisonResult {
  outcome: 'less' | 'greater' | 'equal' | 'invalid'
  ttest: {
    twoSided: SingleTTest
    greater: SingleTTest
    less: SingleTTest
    degreesOfFreedom: number
    tValue: number
  }
  meanDifference: number
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
}

export type ConfidenceInterval = [number | null, number | null]

// eslint-disable-next-line no-magic-numbers
const DEFAULT_KERNEL_STRETCH_FACTOR_RANGE = [0.8, 2.5] as const
const MINIMAL_MULTI_THRESHOLD_TESTING_THRESHOLD_DIFFERENCE_TO_STDEV_RATIO = 0.5

const DEFAULT_KERNEL_STRETCH_FACTOR_SEARCH_STEP_SIZE = 0.1
export function compare({
  data1,
  data2,
  rejectedData1,
  rejectedData2,
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
}: {
  data1: number[]
  data2: number[]
  rejectedData1?: number[]
  rejectedData2?: number[]
  confidenceLevel?: number
  kernelStretchFactorRange?: readonly [lower: number, upper: number]
  kernelStretchFactorSearchStepSize?: number
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
  const meanDifference = mean1 - mean2

  const [twoSided, greater, less] = [
    ttest2(data1, data2, {
      alternative: 'two-sided',
      alpha: 1 - confidenceLevel,
    }),
    ttest2(data1, data2, {
      alternative: 'greater',
      alpha: 1 - confidenceLevel,
    }),
    ttest2(data1, data2, {
      alternative: 'less',
      alpha: 1 - confidenceLevel,
    }),
  ]

  const isInvalid =
    Number.isNaN(twoSided.pValue) ||
    Number.isNaN(greater.pValue) ||
    Number.isNaN(less.pValue)

  const bothAreExactlyEqual = meanDifference === 0 && data1[0] === data2[0]

  // hypothesis: Actual difference in means is not equal to 0
  const outcome = bothAreExactlyEqual
    ? 'equal'
    : isInvalid
    ? 'invalid'
    : // first is greater than second
    greater.rejected
    ? 'less'
    : // first is less than second
    less.rejected
    ? 'greater'
    : 'equal'

  const result = {
    outcome,
    meanDifference,
    pooledVariance,
    pooledStDev,
    ttest: {
      // how many standard deviations away from the mean of the distribution:
      tValue: twoSided.statistic,
      degreesOfFreedom: twoSided.df,
      twoSided: {
        rejected: twoSided.rejected,
        pValue: twoSided.pValue,
        confidenceInterval: twoSided.ci as ConfidenceInterval,
      },
      greater: {
        rejected: greater.rejected,
        pValue: greater.pValue,
        confidenceInterval: greater.ci as ConfidenceInterval,
      },
      less: {
        rejected: less.rejected,
        pValue: less.pValue,
        confidenceInterval: less.ci as ConfidenceInterval,
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
      validCount: data1.length,
      rejectedCount: rejectedData1?.length ?? 0,
      rejectedData: rejectedData1 ?? [],
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
      validCount: data2.length,
      rejectedCount: rejectedData2?.length ?? 0,
      rejectedData: rejectedData2 ?? [],
      data: sorted2,
    },
  } as const

  if (noiseValuesPerSample === 0) return result

  // denoising logic:
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
    (kernelStretchFactorUpperRange - kernelStretchFactorLowerRange) * numerator

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
    // we multiply by two if we test both bandwidth/threshold pairs
    iterations: itIsWorthTestingBothThresholds
      ? optimizationIterations * 2
      : optimizationIterations,
    compare: ([splitA1, splitA2], [splitB1, splitB2]) => {
      const [comparisonA, comparisonB] = [
        compare({
          data1: splitA1.largestSplit,
          rejectedData1: splitA1.rejectedData,
          data2: splitA2.largestSplit,
          rejectedData2: splitA2.rejectedData,
          confidenceLevel,
          precisionDelta,
        }),
        compare({
          data1: splitB1.largestSplit,
          rejectedData1: splitB1.rejectedData,
          data2: splitB2.largestSplit,
          rejectedData2: splitB2.rejectedData,
          confidenceLevel,
          precisionDelta,
        }),
      ]

      // an alternative would be to compare stdevDifference:
      // const stdevDiffA = Math.abs(
      //   comparisonA.data1.stdev - comparisonA.data2.stdev,
      // )
      // const stdevDiffB = Math.abs(
      //   comparisonB.data1.stdev - comparisonB.data2.stdev,
      // )
      // const valueA = stdevDiffA
      // const valueB = stdevDiffB

      const valueA = comparisonA.pooledStDev - comparisonB.pooledStDev
      const valueB = comparisonA.pooledStDev - comparisonB.pooledStDev

      // the more similar the pooledStDev between the two, the better
      // another option would be to sort by the lowest mean difference,
      // though this might introduce bias towards "equality"

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

  // we want to count the number of times the comparison was equal/greater/less,
  // and choose the best one from those
  const bestComparisonsFromMostCommonOutcome = utils.mostCommonBy(
    bestComparisons,
    ([_settings, _split, [comparison]]) => comparison.outcome,
  )

  const [denoiseSettings, [splitMetadata1, splitMetadata2], [betterBand]] =
    bestComparisonsFromMostCommonOutcome[0]!

  return Math.abs(meanDifference) <= Math.abs(betterBand.meanDifference)
    ? result
    : {
        ...betterBand,
        data1: {
          ...betterBand.data1,
          modalityCount: splitMetadata1.modalityCount,
        },
        data2: {
          ...betterBand.data2,
          modalityCount: splitMetadata2.modalityCount,
        },
        // Calculate the effect size using Cohen's d;
        // this is delayed to the last moment for performance
        effectSize: getCohensDStats({
          mean1,
          mean2,
          pooledStDev,
          data1,
          data2,
        }),
        originalResult: result,
        denoiseSettings,
      }
}
