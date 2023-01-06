/* eslint-disable unicorn/prefer-native-coercion-functions */
import ttest2 from '@stdlib/stats-ttest2'
import { calcCL, calcCohensD, calcGaussOverlap, calcU3 } from './cohensd'
import {
  calculateSilvermansRuleOfThumbBandwidth,
  optimalThreshold,
  OptimalThresholdConfigBase,
} from './kernelDensityEstimate'
import { getModalityData, matchModalities } from './matchModalities'
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
  splitsAndTheirDistribution: (readonly [number[], number])[]
  separateModalitySizeThreshold: number
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
    splitsAndTheirDistribution,
    separateModalitySizeThreshold,
    modalityCount,
    modalities,
    largestModalityIndex,
  }
}

export function getMatchingModalities(
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

export type ComparisonOutcome = 'less' | 'greater' | 'similar' | 'invalid'

export interface ComparisonResult {
  outcome: ComparisonOutcome
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
  // present when multimodal
  comparedModalities1?: SampleStatistics[]
  comparedModalities2?: SampleStatistics[]
  discardedModalities1?: number[][]
  discardedModalities2?: number[][]
}

export type ConfidenceInterval = readonly [number | null, number | null]

// eslint-disable-next-line no-magic-numbers
const DEFAULT_KERNEL_STRETCH_FACTOR_RANGE = [0.8, 2.5] as const
const MINIMAL_MULTI_THRESHOLD_TESTING_THRESHOLD_DIFFERENCE_TO_STDEV_RATIO = 0.5
const DEFAULT_KERNEL_STRETCH_FACTOR_SEARCH_STEP_SIZE = 0.1
const DEFAULT_MINIMAL_MODALITY_SIZE = 3

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

export const mergeComparisons = ({
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
  if (comparisons.length === 1) {
    return comparisons[0]!
  }
  const comparisonsWithMostCommonOutcome = utils.mostCommonBy(
    comparisons,
    (c) => c.outcome,
  )
  const outcome = comparisonsWithMostCommonOutcome[0]?.outcome ?? 'invalid'
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
  function mergeTTest(type: 'twoSided' | 'greater' | 'less'): SingleTTest {
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

  return {
    outcome,
    ttest,
    meanDifference: weightedMeanDifference,
    pooledVariance: weightedPooledVariance,
    pooledStDev: weightedPooledStDev,
    data1: {
      data: allUsedData1,
      mean: comparisonsWithWeights.reduce(
        (sum, c) => sum + c.data1.mean * c.weight1,
        0,
      ),
      stdev: comparisonsWithWeights.reduce(
        (sum, c) => sum + c.data1.stdev * c.weight1,
        0,
      ),
      rejectedCount: discardedModalities1.length,
      rejectedData: discardedModalities1.flat(),
      normalityProbability: comparisonsWithWeights.reduce(
        (sum, c) => sum + c.data1.normalityProbability * c.weight1,
        0,
      ),
      validCount: allUsedData1.length,
      modalityCount: comparisonsWithWeights.length,
      variance: comparisonsWithWeights.reduce(
        (sum, c) => sum + c.data1.variance * c.weight1,
        0,
      ),
    },
    data2: {
      data: allUsedData2,
      mean: comparisonsWithWeights.reduce(
        (sum, c) => sum + c.data2.mean * c.weight2,
        0,
      ),
      stdev: comparisonsWithWeights.reduce(
        (sum, c) => sum + c.data2.stdev * c.weight2,
        0,
      ),
      rejectedCount: discardedModalities2.length,
      rejectedData: discardedModalities2.flat(),
      normalityProbability: comparisonsWithWeights.reduce(
        (sum, c) => sum + c.data2.normalityProbability * c.weight2,
        0,
      ),
      validCount: allUsedData2.length,
      modalityCount: comparisonsWithWeights.length,
      variance: comparisonsWithWeights.reduce(
        (sum, c) => sum + c.data2.variance * c.weight2,
        0,
      ),
    },
    comparedModalities1: comparisons.map((c) => c.data1),
    comparedModalities2: comparisons.map((c) => c.data2),
    discardedModalities1,
    discardedModalities2,
  }
}

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
  minimalModalitySize = DEFAULT_MINIMAL_MODALITY_SIZE,
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
        confidenceInterval: [twoSided.ci[0] ?? null, twoSided.ci[1] ?? null],
      },
      greater: {
        rejected: greater.rejected,
        pValue: greater.pValue,
        confidenceInterval: [greater.ci[0] ?? null, greater.ci[1] ?? null],
      },
      less: {
        rejected: less.rejected,
        pValue: less.pValue,
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
      const matchingA = matchModalities({
        rawSplits1: splitA1.rawSplits,
        rawSplits2: splitA2.rawSplits,
      }).map(getModalityData)
      const matchingB = matchModalities({
        rawSplits1: splitB1.rawSplits,
        rawSplits2: splitB2.rawSplits,
      }).map(getModalityData)

      const [usableModalitiesA, discardedModalitiesA] = utils.partition(
        matchingA,
        getIsUsableModality(minimalModalitySize),
      )
      const [usableModalitiesB, discardedModalitiesB] = utils.partition(
        matchingB,
        getIsUsableModality(minimalModalitySize),
      )
      const comparisonsA = usableModalitiesA.map(([d1, d2]) =>
        compare({
          data1: d1,
          data2: d2,
          confidenceLevel,
          precisionDelta,
        }),
      )
      const comparisonsB = usableModalitiesB.map(([d1, d2]) =>
        compare({
          data1: d1,
          data2: d2,
          confidenceLevel,
          precisionDelta,
        }),
      )

      const [comparisonA, comparisonB] = [
        mergeComparisons({
          comparisons: comparisonsA,
          confidenceLevel,
          discardedModalities1: discardedModalitiesA
            .map(([a, b]) => a)
            .filter((arr): arr is number[] => Boolean(arr)),
          discardedModalities2: discardedModalitiesA
            .map(([a, b]) => b)
            .filter((arr): arr is number[] => Boolean(arr)),
        }),
        mergeComparisons({
          comparisons: comparisonsB,
          confidenceLevel,
          discardedModalities1: discardedModalitiesB
            .map(([a, b]) => a)
            .filter((arr): arr is number[] => Boolean(arr)),
          discardedModalities2: discardedModalitiesB
            .map(([a, b]) => b)
            .filter((arr): arr is number[] => Boolean(arr)),
        }),
      ]
      // const [comparisonA, comparisonB] = [
      //   compare({
      //     data1: matchingA.data1,
      //     rejectedData1: matchingA.remaining1,
      //     data2: matchingA.data2,
      //     rejectedData2: matchingA.remaining2,
      //     confidenceLevel,
      //     precisionDelta,
      //   }),
      //   compare({
      //     data1: matchingB.data1,
      //     rejectedData1: matchingB.remaining1,
      //     data2: matchingB.data2,
      //     rejectedData2: matchingB.remaining2,
      //     confidenceLevel,
      //     precisionDelta,
      //   }),
      // ]

      const stdevDiffA = Math.abs(
        comparisonA.data1.stdev - comparisonA.data2.stdev,
      )
      const stdevDiffB = Math.abs(
        comparisonB.data1.stdev - comparisonB.data2.stdev,
      )
      const valueA = stdevDiffA
      const valueB = stdevDiffB

      // an alternative would be to compare pooledStDev:
      // const valueA = comparisonA.pooledStDev
      // const valueB = comparisonB.pooledStDev

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
