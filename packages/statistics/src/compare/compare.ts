import ttest2 from '@stdlib/stats-ttest2'
import { calcChangeProbability } from '../effectSize/cohensd'
import { getEffectSizeStats } from '../effectSize/effectSizeStats'
import type { GetSplitsReturnType } from '../modality/getSplits'
import { calcShapiroWilk } from '../normality'
import type { OptimizationResult } from '../optimize'
import * as utils from '../utilities'
import type { ComparisonQualityWeightingOptions } from './compareSplitPermutations'
import {
  compareWithKDEDenoising,
  KDEOptimizationParameters,
} from './compareWithKDEDenoising'
import {
  compareWithQuantileDenoising,
  QuantileOptimizationParameters,
} from './compareWithQuantileDenoising'
import {
  DEFAULT_CONFIDENCE_LEVEL,
  DEFAULT_MINIMAL_ABSOLUTE_CHANGE_PROBABILITY,
  DEFAULT_MINIMAL_MODALITY_SIZE,
  DEFAULT_MINIMUM_USED_TO_TOTAL_SAMPLES_RATIO,
  DEFAULT_OUTCOME_FREQUENCY_PVALUE_ADJUSTMENT_FACTOR,
} from './defaults'
import { getOutcome } from './getOutcome'
import type {
  ComparisonOutcome,
  ComparisonResult,
  DenoisingAndModalitySplittingOptions,
  GetOutcomeOptions,
  InternalGetOutcomeOptions,
} from './types'

export function compare({
  data1,
  data2,
  discardedData1,
  discardedData2,
  confidenceLevel = DEFAULT_CONFIDENCE_LEVEL,
  minimalModalitySize = DEFAULT_MINIMAL_MODALITY_SIZE,
  minimumUsedToTotalSamplesRatio = DEFAULT_MINIMUM_USED_TO_TOTAL_SAMPLES_RATIO,
  outcomeFrequencyPValueAdjustmentFactor = DEFAULT_OUTCOME_FREQUENCY_PVALUE_ADJUSTMENT_FACTOR,
  getOutcomeOptions: getOutcomeOptionsPartial = {},
  comparisonQualityWeightingOptions = {},
  denoisingAndModalitySplittingOptions = { type: 'none' },
}: {
  data1: number[]
  data2: number[]
  discardedData1?: number[]
  discardedData2?: number[]
  confidenceLevel?: number
  minimalModalitySize?: number
  minimumUsedToTotalSamplesRatio?: number
  outcomeFrequencyPValueAdjustmentFactor?: number
  getOutcomeOptions?: Partial<GetOutcomeOptions>
  comparisonQualityWeightingOptions?: Partial<ComparisonQualityWeightingOptions>
  denoisingAndModalitySplittingOptions?: DenoisingAndModalitySplittingOptions
}): ComparisonResult {
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

  const effectSizeStats = getEffectSizeStats({
    mean1,
    mean2,
    pooledStDev,
    data1: sorted1,
    data2: sorted2,
  })

  const getOutcomeOptions: InternalGetOutcomeOptions = {
    minimalAbsoluteChangeProbability:
      'minimalCohensD' in getOutcomeOptionsPartial &&
      typeof getOutcomeOptionsPartial.minimalCohensD === 'number'
        ? calcChangeProbability(getOutcomeOptionsPartial.minimalCohensD)
        : DEFAULT_MINIMAL_ABSOLUTE_CHANGE_PROBABILITY,
    requireTwoSidedNullHypothesisRejection: false,
    ...getOutcomeOptionsPartial,
  }

  const { outcome, definitive: definitiveOutcomeEstablished } = getOutcome(
    { twoSided, greater, less },
    { meanDifference, data1, data2, effectSizeStats },
    getOutcomeOptions,
  )

  let result: ComparisonResult = {
    outcome,
    meanDifference,
    stdevDifference: stdev1 - stdev2,
    pooledVariance,
    pooledStDev,
    effectSizeStats,
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
    denoisingAndModalitySplittingOptions.type === 'none' ||
    definitiveOutcomeEstablished ||
    data1.length <= 2 ||
    data2.length <= 2
  ) {
    return result
  }

  // apply denoising logic:
  const bestComparisons: OptimizationResult<
    QuantileOptimizationParameters | KDEOptimizationParameters,
    readonly [GetSplitsReturnType, GetSplitsReturnType],
    ComparisonResult
  >[] =
    denoisingAndModalitySplittingOptions.type === 'kde'
      ? compareWithKDEDenoising({
          data1,
          data2,
          sorted1,
          sorted2,
          stdev1,
          stdev2,
          confidenceLevel,
          getOutcomeOptions,
          minimalModalitySize,
          minimumUsedToTotalSamplesRatio,
          comparisonQualityWeightingOptions,
          kdeOptions: denoisingAndModalitySplittingOptions.options,
        })
      : compareWithQuantileDenoising({
          data1,
          data2,
          sorted1,
          sorted2,
          stdev1,
          stdev2,
          confidenceLevel,
          getOutcomeOptions,
          minimalModalitySize,
          minimumUsedToTotalSamplesRatio,
          comparisonQualityWeightingOptions,
          quantileOptions: denoisingAndModalitySplittingOptions.options,
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
      [comparison?.outcome, count / bestComparisons.length] as const,
  )

  const outcomeFrequencies = Object.fromEntries(outcomeFrequenciesArray) as {
    [outcome in ComparisonOutcome]?: number
  }

  const bestComparisonsFromMostCommonOutcome = outcomeByFrequency[0]?.[0]

  const [
    optimizationParameters,
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
        ? 1 - (1 - betterComparison.ttest.twoSided.pValue) * twoSidedAdjustment
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
            outcome: getOutcome(
              ttestAdjusted,
              {
                data1: betterComparison.data1.data,
                data2: betterComparison.data2.data,
                meanDifference: betterComparison.meanDifference,
                effectSizeStats: betterComparison.effectSizeStats,
              },
              getOutcomeOptions,
            ).outcome,
            outcomeFrequencies,
          }
        : {}),
      originalResult: result,
      denoiseSettings: optimizationParameters,
    }
  }
  result.data1.modalityCount =
    result.data1.modalityCount ?? splitMetadata1?.modalityCount ?? 1
  result.data2.modalityCount =
    result.data2.modalityCount ?? splitMetadata2?.modalityCount ?? 1
  return result
}
