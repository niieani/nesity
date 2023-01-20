import * as ratioTransformation from '../ratioTransformation'
import * as utils from '../utilities'
import type { GetSplitsReturnType } from './getSplits'

export interface MappedSplit {
  data: number[]
  mean: number
  index: number
  source: number
}

export interface MatchedSplit {
  split: MappedSplit
  otherSplitMatches: {
    split: MappedSplit
    distanceFactor: number
    // we can assume >=0.7 for a good match
    sizeRatio: number
  }[]
}

export interface MatchModalitiesConfig {
  rawSplits1: readonly number[][]
  rawSplits2: readonly number[][]
  meanDistanceWeight?: number
  sizeRatioWeight?: number
  /**
   * If the size of the split is within this ratio of the other split, prioritize the match
   * Otherwise, all splits that do not have the correct ratio will be matched in the 2nd pass
   */
  prioritizeSizeRatioAbove?: number
}

export const HIGH_QUALITY_SAMPLE_COUNT = 100
export const MINIMUM_SIZE_RATIO_ABOVE = 0.5
export const getPrioritizationSizeRatio = (
  sampleCount: number,
  highQualitySampleCount = HIGH_QUALITY_SAMPLE_COUNT,
) =>
  MINIMUM_SIZE_RATIO_ABOVE +
  (Math.min(sampleCount, highQualitySampleCount) /
    (highQualitySampleCount * 2)) **
    // eslint-disable-next-line no-magic-numbers
    1.5

export function matchModalities({
  rawSplits1,
  rawSplits2,
  meanDistanceWeight = 1,
  sizeRatioWeight = 1,
  prioritizeSizeRatioAbove = Math.min(
    getPrioritizationSizeRatio(rawSplits1.flat().length),
    getPrioritizationSizeRatio(rawSplits2.flat().length),
  ),
}: MatchModalitiesConfig) {
  const means1 = rawSplits1
    .map<MappedSplit>((data, index) => ({
      data,
      mean: utils.mean(data),
      index,
      source: 1,
    }))
    .sort((a, b) => a.mean - b.mean)
  const means2 = rawSplits2
    .map<MappedSplit>((data, index) => ({
      data,
      mean: utils.mean(data),
      index,
      source: 2,
    }))
    .sort((a, b) => a.mean - b.mean)
  const sideWithMoreSplits = means1.length > means2.length ? means1 : means2
  const sideWithFewerSplits = means1.length > means2.length ? means2 : means1
  const splitsDifference =
    sideWithMoreSplits.length - sideWithFewerSplits.length

  const maxMeanDistance = Math.max(
    ...sideWithMoreSplits.flatMap((split) =>
      sideWithFewerSplits.map((otherSplit) =>
        Math.abs(split.mean - otherSplit.mean),
      ),
    ),
  )
  const matchedSplitsWithoutPrioritizationAdjustment = sideWithMoreSplits.map(
    (split) => {
      const localMaxMeanDistance = Math.max(
        ...sideWithFewerSplits.map((otherSplit) =>
          Math.abs(split.mean - otherSplit.mean),
        ),
      )
      const otherSplitMatches = sideWithFewerSplits.map((otherSplit) => {
        const sizeRatio =
          Math.min(split.data.length, otherSplit.data.length) /
          Math.max(split.data.length, otherSplit.data.length)
        const prioritizedBySize = sizeRatio > prioritizeSizeRatioAbove
        return {
          split: otherSplit,
          // prioritize both mean closeness by mean (1x) and group size ratio (0.5x)
          globalScore: -(
            -(
              1 -
              Math.abs(split.mean - otherSplit.mean) / localMaxMeanDistance
            ) *
              meanDistanceWeight +
            (1 - ratioTransformation.complimentarySquare(sizeRatio)) *
              sizeRatioWeight
          ),
          mean1: split.mean,
          mean2: otherSplit.mean,
          globalCloseness:
            1 - Math.abs(split.mean - otherSplit.mean) / maxMeanDistance,
          prioritizedBySize,
          // assuming both datasets have been captured similarly,
          // all modalities should have more or less a similar number of samples
          // we can assume >=0.7 for a good match (actual prioritization level is a function of the number of samples, as smaller samples are more likely to be noisy)
          sizeRatio,
        }
      })
      return {
        split,
        otherSplitMatches,
      }
    },
  )

  const allPrioritizedBySize = matchedSplitsWithoutPrioritizationAdjustment
    .flatMap(({ otherSplitMatches }) => otherSplitMatches)
    .every(({ prioritizedBySize }) => prioritizedBySize)

  const matchedSplits = matchedSplitsWithoutPrioritizationAdjustment.map(
    ({ otherSplitMatches, ...rest }) => ({
      ...rest,
      otherSplitMatches: allPrioritizedBySize
        ? otherSplitMatches.map((otherSplit) => ({
            ...otherSplit,
            prioritizedBySize: false,
          }))
        : otherSplitMatches,
    }),
  )
  type OtherMatch = typeof matchedSplits[number]['otherSplitMatches'][number]

  const getGlobalScore = (
    pair: {
      bestMatch?: OtherMatch
    }[],
  ) =>
    utils.mean(
      pair
        .filter(({ bestMatch }) => Boolean(bestMatch))
        .map(({ bestMatch }) =>
          !bestMatch
            ? 0
            : bestMatch.globalScore + (bestMatch.prioritizedBySize ? 1 : 0),
        ),
    )

  const permutations = Array.from({
    length: sideWithFewerSplits.length,
  })
    .flatMap((_, rotationIndex) =>
      Array.from(
        {
          length:
            splitsDifference > 0 ? splitsDifference * matchedSplits.length : 1,
        },
        (__, skipIndexInfo) => {
          const skipIndex =
            splitsDifference > 0 ? skipIndexInfo % matchedSplits.length : -1
          const assignedIndexes = new Set<number>()
          return matchedSplits.map(
            ({ split, otherSplitMatches }, splitIndex) => {
              if (splitIndex === skipIndex)
                return {
                  split,
                  bestMatch: undefined,
                  otherSplitMatches: [],
                  skipped: true,
                }
              const rotatedOtherSplitMatches =
                otherSplitMatches.length > 0
                  ? [
                      ...otherSplitMatches.slice(rotationIndex),
                      ...otherSplitMatches.slice(0, rotationIndex),
                    ]
                  : []

              let bestMatch: OtherMatch | undefined
              while (rotatedOtherSplitMatches.length > 0 && !bestMatch) {
                bestMatch = rotatedOtherSplitMatches.shift()
                if (bestMatch && !assignedIndexes.has(bestMatch.split.index)) {
                  assignedIndexes.add(bestMatch.split.index)
                } else {
                  bestMatch = undefined
                }
              }
              return { split, bestMatch }
            },
          )
        },
      ),
    )
    .sort((a, b) => getGlobalScore(b) - getGlobalScore(a))

  const permutationWithHighestGlobalClosenessFactor =
    permutations.find(
      (permutation) =>
        permutation.every(
          (split) => !split.bestMatch || split.bestMatch.globalCloseness > 0,
        ) ||
        permutation.filter(
          (split) => !split.bestMatch || split.bestMatch.prioritizedBySize,
        ).length >
          permutation.length / 2,
    ) ?? permutations[0]!

  return permutationWithHighestGlobalClosenessFactor
    .sort((a, b) => a.split.mean - b.split.mean)
    .map(({ split, bestMatch }) =>
      split.source === 1
        ? ([split, bestMatch?.split] as const)
        : ([bestMatch?.split, split] as const),
    )
}

// helper that only returns data
export const getModalityData = (
  input:
    | readonly [MappedSplit | undefined, MappedSplit]
    | readonly [MappedSplit, MappedSplit | undefined],
): [number[] | undefined, number[] | undefined] => [
  input[0]?.data,
  input[1]?.data,
]

export function getMatchedUsableModalities({
  isUsableModality,
  ...config
}: MatchModalitiesConfig & {
  isUsableModality: (
    split: [number[] | undefined, number[] | undefined],
  ) => split is [number[], number[]]
}) {
  const matching = matchModalities(config).map(getModalityData)
  const [usableModalities, discardedModalities] = utils.partition(
    matching,
    isUsableModality,
  )
  return { usableModalities, discardedModalities }
}

// simpler version that only matches the largest modality:
export function getBestMatchingModality(
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
