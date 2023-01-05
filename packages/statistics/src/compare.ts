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

interface GetSplitsReturnType {
  rawSplitsSortedBySize: number[][]
  rawSplits: number[][]
  largestSplitIndex: number
  modalityCount: number
  modalities: number[][]
  largestModalityIndex: number
}

function getSplits({
  kernelStretchFactor,
  noiseValuesPerSample,
  random,
  bandwidth,
  threshold,
  sortedData,
  // by default, at least 80% of the data must be in a split to count as a separate modality
  getSeparateModalitySizeThreshold = (splitsCount: number) =>
    (1 / splitsCount) * DEFAULT_MODALITY_SPLIT_TO_NOISE_RATIO,
  iterations,
}: Pick<
  SplitMultiModalDistributionConfig,
  'kernelStretchFactor' | 'noiseValuesPerSample' | 'random' | 'iterations'
> & {
  bandwidth: number
  threshold: number
  sortedData: number[]
  getSeparateModalitySizeThreshold?: (splitsCount: number) => number
}): GetSplitsReturnType {
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
  const rawSplits = splitMultimodalDistribution({ sortedData, ...common })
  const rawSplitsSortedBySize = [...rawSplits].sort(
    (a, b) => b.length - a.length,
  )
  const largestSplitIndex = rawSplits.indexOf(rawSplitsSortedBySize[0]!)

  // in order to count as a separate modality,
  // each split must contain at least it's proportionate amount of the data
  const separateModalitySizeThreshold = getSeparateModalitySizeThreshold(
    rawSplits.length,
  )
  const splitsAndTheirDistribution = rawSplits.map(
    (split) => [split, split.length / sortedData.length] as const,
  )
  const modalities = splitsAndTheirDistribution
    .filter(
      ([, modalitySizeRatio]) =>
        modalitySizeRatio >= separateModalitySizeThreshold,
    )
    .map(([modality]) => modality)
  const modalityCount = modalities.length
  const largestModalityIndex = modalities.indexOf(rawSplitsSortedBySize[0]!)

  return {
    rawSplits,
    rawSplitsSortedBySize,
    largestSplitIndex,
    modalityCount,
    modalities,
    largestModalityIndex,
  }
}

function getMatchingModalities(
  split1: GetSplitsReturnType,
  split2: GetSplitsReturnType,
) {
  const sameModalityCount = split1.modalityCount === split2.modalityCount
  const averageSizesOfModalities =
    sameModalityCount && split1.modalityCount > 1
      ? split1.modalities.map(
          (data1, index) =>
            (data1.length + split2.modalities[index]!.length) / 2,
        )
      : null

  // if the modalities are the same, we need to compare the same one with the same,
  // even if it is not the largest one in the 2nd case
  // if the sizes of modalities are the same, we compare the largest one with the largest one (hence reversal)
  const bestOverallModalityIndex1 = averageSizesOfModalities
    ? averageSizesOfModalities.length -
      1 -
      [...averageSizesOfModalities]
        .reverse()
        .indexOf(Math.max(...averageSizesOfModalities))
    : split1.largestModalityIndex
  const bestOverallModalityIndex2 = sameModalityCount
    ? bestOverallModalityIndex1
    : split2.largestModalityIndex

  const data1 = split1.modalities[bestOverallModalityIndex1]!
  const data2 = split2.modalities[bestOverallModalityIndex2]!

  const rawSplitIndex1 = split1.rawSplits.indexOf(data1)
  const rawSplitIndex2 = split2.rawSplits.indexOf(data2)
  const remainingData1 = [...split1.rawSplits]
  remainingData1.splice(rawSplitIndex1, 1)
  const remaining1 = remainingData1.flat()
  const remainingData2 = [...split2.rawSplits]
  remainingData2.splice(rawSplitIndex2, 1)
  const remaining2 = remainingData2.flat()

  return { data1, data2, remaining1, remaining2 }
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
  outcome: 'less' | 'greater' | 'similar' | 'invalid'
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
  const meanDifference = mean2 - mean1

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
    ? 'similar'
    : isInvalid
    ? 'invalid'
    : // first is greater than second
    greater.rejected
    ? 'less'
    : // first is less than second
    less.rejected
    ? 'greater'
    : 'similar'

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
      const matchingA = getMatchingModalities(splitA1, splitA2)
      const matchingB = getMatchingModalities(splitB1, splitB2)

      const [comparisonA, comparisonB] = [
        compare({
          data1: matchingA.data1,
          rejectedData1: matchingA.remaining1,
          data2: matchingA.data2,
          rejectedData2: matchingA.remaining2,
          confidenceLevel,
          precisionDelta,
        }),
        compare({
          data1: matchingB.data1,
          rejectedData1: matchingB.remaining1,
          data2: matchingB.data2,
          rejectedData2: matchingB.remaining2,
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

      const valueA = comparisonA.pooledStDev
      const valueB = comparisonB.pooledStDev

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

  const betterResult =
    Math.abs(meanDifference) < Math.abs(betterBand.meanDifference)
      ? result
      : betterBand

  return {
    ...betterResult,
    data1: {
      ...betterResult.data1,
      modalityCount: splitMetadata1.modalityCount,
    },
    data2: {
      ...betterResult.data2,
      modalityCount: splitMetadata2.modalityCount,
    },
    // Calculate the effect size using Cohen's d;
    // this is delayed to the last moment for performance
    effectSize: getCohensDStats({
      mean1: betterResult.data1.mean,
      mean2: betterResult.data2.mean,
      pooledStDev: betterResult.pooledStDev,
      data1: betterResult.data1.data,
      data2: betterResult.data2.data,
    }),
    originalResult: result !== betterResult ? result : undefined,
    denoiseSettings: result !== betterResult ? denoiseSettings : undefined,
  }
}
