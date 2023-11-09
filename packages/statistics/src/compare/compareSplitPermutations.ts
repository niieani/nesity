/* eslint-disable unicorn/prefer-native-coercion-functions */
import type { GetSplitsReturnType } from '../modality/getSplits.js'
import { getMatchedUsableModalities } from '../modality/matchModalities.js'
import { INVALID_LEFT, INVALID_RIGHT } from '../optimize.js'
import { compare } from './compare.js'
import {
  DEFAULT_DISCARDED_DATA_PENALTY_FACTOR,
  DEFAULT_HIGH_MEAN_DISTANCE_RATIO_PENALTY_FACTOR,
  DEFAULT_HIGH_POOLED_STDEV_PENALTY_FACTOR,
  DEFAULT_MINIMAL_MODALITY_SIZE,
  DEFAULT_MODALITY_COUNT_SIMILARITY_BONUS_FACTOR,
  DEFAULT_NOISE_SIZE_BONUS_FACTOR,
  DEFAULT_STDEV_DIFF_PENALTY_FACTOR,
} from './defaults.js'
import { mergeComparisonsFromMultipleModalities } from './mergeComparisonsFromMultipleModalities.js'
import type { ComparisonResult, InternalGetOutcomeOptions } from './types.js'

export interface ComparisonQualityWeightingOptions {
  stdevDiffPenaltyFactor: number
  discardedDataPenaltyFactor: number
  highPooledStdevPenaltyFactor: number
  highMeanDistanceRatioPenaltyFactor: number
  noiseSizeBonusFactor: number
  modalityCountSimilarityBonusFactor: number
}

export const getIsUsableModality =
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

export const getCachedCompareFunction =
  ({
    stdevDiffPenaltyFactor = DEFAULT_STDEV_DIFF_PENALTY_FACTOR,
    discardedDataPenaltyFactor = DEFAULT_DISCARDED_DATA_PENALTY_FACTOR,
    highPooledStdevPenaltyFactor = DEFAULT_HIGH_POOLED_STDEV_PENALTY_FACTOR,
    highMeanDistanceRatioPenaltyFactor = DEFAULT_HIGH_MEAN_DISTANCE_RATIO_PENALTY_FACTOR,
    noiseSizeBonusFactor = DEFAULT_NOISE_SIZE_BONUS_FACTOR,
    modalityCountSimilarityBonusFactor = DEFAULT_MODALITY_COUNT_SIMILARITY_BONUS_FACTOR,
  }: Partial<ComparisonQualityWeightingOptions>) =>
  (
    _splitsA: readonly [GetSplitsReturnType, GetSplitsReturnType],
    _splitsB: readonly [GetSplitsReturnType, GetSplitsReturnType],
    indexA: number,
    indexB: number,
    c:
      | {
          comparisons: (ComparisonResult | undefined)[]
          maxPooledStdev: number
          maxStdevDifference: number
          maxNoiseCount1: number
          maxNoiseCount2: number
          maxMeanDistance1: number
          maxMeanDistance2: number
          maxDiscardedCount1: number
          maxDiscardedCount2: number
        }
      | undefined,
  ):
    | typeof INVALID_LEFT
    | typeof INVALID_RIGHT
    | [compareRank: number, compareMeta: ComparisonResult] => {
    const cache = c!
    const comparisonA: ComparisonResult | undefined = cache?.comparisons[indexA]
    const comparisonB: ComparisonResult | undefined = cache?.comparisons[indexB]

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

    const modalitySimilarityBonusA =
      Math.min(
        comparisonA.data1.modalityCount ?? 1,
        comparisonA.data2.modalityCount ?? 1,
      ) /
      Math.max(
        comparisonA.data1.modalityCount ?? 1,
        comparisonA.data2.modalityCount ?? 1,
      )
    const modalitySimilarityBonusB =
      Math.min(
        comparisonB.data1.modalityCount ?? 1,
        comparisonB.data2.modalityCount ?? 1,
      ) /
      Math.max(
        comparisonB.data1.modalityCount ?? 1,
        comparisonB.data2.modalityCount ?? 1,
      )

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
      overallNoiseSizeBonusA * -noiseSizeBonusFactor +
      modalitySimilarityBonusA * -modalityCountSimilarityBonusFactor
    const valueB =
      stdevDiffPenaltyB * stdevDiffPenaltyFactor +
      overallDiscardedDataPenaltyB * discardedDataPenaltyFactor +
      pooledStdevPenaltyB * highPooledStdevPenaltyFactor +
      overallMeanDistancePenaltyB * highMeanDistanceRatioPenaltyFactor +
      overallNoiseSizeBonusB * -noiseSizeBonusFactor +
      modalitySimilarityBonusB * -modalityCountSimilarityBonusFactor
    // the more similar the stdevDifference and pooledStDev between the two, the better
    return [
      valueA - valueB,
      // return lower first -- it will be one representing the ranking
      valueA < valueB ? comparisonA : comparisonB,
    ]
  }

export function compareSplitPermutations({
  data1,
  data2,
  minimalModalitySize,
  splitPermutations,
  confidenceLevel,
  getOutcomeOptions,
  minimumUsedToTotalSamplesRatio,
}: {
  data1: number[]
  data2: number[]
  splitPermutations: (readonly [GetSplitsReturnType, GetSplitsReturnType])[]
  minimalModalitySize: number
  confidenceLevel: number
  getOutcomeOptions: InternalGetOutcomeOptions
  minimumUsedToTotalSamplesRatio: number
}) {
  const isUsableModality = getIsUsableModality(minimalModalitySize)
  const comparisons = splitPermutations.map(([split1, split2]) => {
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
        .filter((rd): rd is number[] => Boolean(rd)),
      discardedModalities
        .map(([, rd2]) => rd2)
        .filter((rd): rd is number[] => Boolean(rd)),
    ]
    const modalityComparisons = usableModalities.map(([d1, d2]) =>
      compare({
        data1: d1,
        data2: d2,
        confidenceLevel,
        getOutcomeOptions,
      }),
    )
    const comparison = mergeComparisonsFromMultipleModalities({
      comparisons: modalityComparisons,
      confidenceLevel,
      discardedModalities1,
      discardedModalities2,
      getOutcomeOptions,
      minimalModalitySize,
    })
    // prettier-ignore
    if (
      comparison.data1.dataCount / data1.length < minimumUsedToTotalSamplesRatio
      ||
      comparison.data2.dataCount / data2.length < minimumUsedToTotalSamplesRatio
    ) {
      return undefined
    }
    return comparison
  })
  const validComparisons = comparisons.filter((c): c is ComparisonResult =>
    Boolean(c),
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
      ...validComparisons.map((comparison) => comparison.data1.noiseCount ?? 0),
    ),
    maxNoiseCount2: Math.max(
      ...validComparisons.map((comparison) => comparison.data2.noiseCount ?? 0),
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
      ...validComparisons.map((comparison) => comparison.data1.discardedCount),
    ),
    maxDiscardedCount2: Math.max(
      ...validComparisons.map((comparison) => comparison.data2.discardedCount),
    ),
  }
}
