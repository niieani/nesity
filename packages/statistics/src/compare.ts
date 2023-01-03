import ttest2 from '@stdlib/stats-ttest2'
import { calcCL, calcCohensD, calcGaussOverlap, calcU3 } from './cohensd'
import {
  calculateSilvermansRuleOfThumbBandwidth,
  optimalThreshold,
  OptimalThresholdConfigBase,
} from './kernelDensityEstimate'
import { calcShapiroWilk } from './normality'
import {
  splitMultimodalDistribution,
  SplitMultiModalDistributionConfig,
} from './splitMultimodalDistribution'
import * as utils from './utilities'

const DEFAULT_CONFIDENCE_LEVEL = 0.95
const DEFAULT_MODALITY_SPLIT_TO_NOISE_RATIO = 0.8

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
}: Pick<
  SplitMultiModalDistributionConfig,
  'kernelStretchFactor' | 'noiseValuesPerSample' | 'random'
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
  > = {
    kernelStretchFactor,
    noiseValuesPerSample,
    random,
    getBandwidth: () => bandwidth,
    getThreshold: () => threshold,
  }
  const splits = splitMultimodalDistribution({ sortedData, ...common })
  const splitsSortedBySize = [...splits].sort((a, b) => b.length - a.length)
  const largestSplit = splitsSortedBySize[0] ?? []
  const rejectedData = splitsSortedBySize.slice(1).flat()
  // in order to count as a separate modality, each split must contain at least it's proportionate amount of the data
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
  invalidCount: number
  data: number[]
  rejectedData: number[]
  modalityCount?: number
}

export interface SingleTTest {
  rejected: boolean
  pValue: number
  confidenceInterval: ConfidenceInterval
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
  cohensD: number
  overlappingCoefficient: number
  probabilityOfSuperiority: number
  nonOverlapMeasure: number
  data1: SampleStatistics
  data2: SampleStatistics
  originalResult?: ComparisonResult
}

export type ConfidenceInterval = [number | null, number | null]

export function compare({
  data1,
  data2,
  rejectedData1,
  rejectedData2,
  minimumVelocityToFirstQuartileRatio,
  precisionDelta,
  noiseValuesPerSample = 0,
  random,
  kernelStretchFactor,
  confidenceLevel = DEFAULT_CONFIDENCE_LEVEL,
}: {
  data1: number[]
  data2: number[]
  rejectedData1?: number[]
  rejectedData2?: number[]
  confidenceLevel?: number
} & OptimalThresholdConfigBase &
  Pick<
    SplitMultiModalDistributionConfig,
    'noiseValuesPerSample' | 'random' | 'kernelStretchFactor'
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

  // Calculate the effect size using Cohen's d
  const cohensD = calcCohensD({ mean1, mean2, pooledStDev, data1, data2 })
  const overlappingCoefficient = calcGaussOverlap(cohensD)
  const probabilityOfSuperiority = calcCL(cohensD)
  const nonOverlapMeasure = calcU3(cohensD)

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
    cohensD,
    overlappingCoefficient,
    probabilityOfSuperiority,
    nonOverlapMeasure,
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
          ? 0
          : Math.max(1 - shapiroWilk1.pValue, 1),
      validCount: data1.length,
      invalidCount: rejectedData1?.length ?? 0,
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
          : Math.max(1 - shapiroWilk2.pValue, 1),
      validCount: data2.length,
      invalidCount: rejectedData2?.length ?? 0,
      rejectedData: rejectedData2 ?? [],
      data: sorted2,
    },
  } as const

  // TODO: might want to reject 1st and 4th quartile outliers in the first pass,
  // or as a 2nd pass before advanced denoising
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

  const common = {
    kernelStretchFactor,
    noiseValuesPerSample,
    random,
  }
  const [splits1band1, splits2band1, splits1band2, splits2band2] = [
    getSplits({
      ...common,
      bandwidth: bandwidth1,
      threshold: threshold1.value,
      sortedData: sorted1,
    }),
    getSplits({
      ...common,
      bandwidth: bandwidth1,
      threshold: threshold1.value,
      sortedData: sorted2,
    }),
    getSplits({
      ...common,
      bandwidth: bandwidth2,
      threshold: threshold2.value,
      sortedData: sorted1,
    }),
    getSplits({
      ...common,
      bandwidth: bandwidth2,
      threshold: threshold2.value,
      sortedData: sorted2,
    }),
  ]

  const [comparedBand1, comparedBand2] = [
    compare({
      data1: splits1band1.largestSplit,
      rejectedData1: splits1band1.rejectedData,
      data2: splits2band1.largestSplit,
      rejectedData2: splits2band1.rejectedData,
      confidenceLevel,
      precisionDelta,
    }),
    compare({
      data1: splits1band2.largestSplit,
      rejectedData1: splits1band2.rejectedData,
      data2: splits2band2.largestSplit,
      rejectedData2: splits2band2.rejectedData,
      confidenceLevel,
      precisionDelta,
    }),
  ]

  const betterBand =
    Math.abs(comparedBand1.meanDifference) <=
    Math.abs(comparedBand2.meanDifference)
      ? comparedBand1
      : comparedBand2

  const [splitMetadata1, splitMetadata2] = [
    betterBand === comparedBand1 ? splits1band1 : splits1band2,
    betterBand === comparedBand1 ? splits2band1 : splits2band2,
  ]

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
        originalResult: result,
      }
}
