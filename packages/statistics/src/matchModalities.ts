import type { GetSplitsReturnType } from './getSplits'
import * as utils from './utilities'

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
  rawSplits1: number[][]
  rawSplits2: number[][]
  meanDistanceWeight?: number
  sizeRatioWeight?: number
  /**
   * If the size of the split is within this ratio of the other split, prioritize the match
   * Otherwise, all splits that do not have the correct ratio will be matched in the 2nd pass
   */
  prioritizeSizeRatioAbove?: number
}

export function matchModalities({
  rawSplits1,
  rawSplits2,
  meanDistanceWeight = 1,
  // eslint-disable-next-line no-magic-numbers
  sizeRatioWeight = 0.5,
  // eslint-disable-next-line no-magic-numbers
  prioritizeSizeRatioAbove = 0.7,
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
  const matchedSplits = sideWithMoreSplits.map((split) => ({
    split,
    otherSplitMatches: sideWithFewerSplits
      .map((otherSplit) => ({
        split: otherSplit,
        // prioritize both mean closeness by mean (1x) and group size ratio (0.5x)
        distanceFactor:
          (Math.abs(split.mean - otherSplit.mean) / split.mean) *
            meanDistanceWeight -
          Math.min(split.data.length, otherSplit.data.length) /
            Math.max(split.data.length, otherSplit.data.length) /
            sizeRatioWeight,
        // we can assume >=0.7 for a good match
        sizeRatio:
          Math.min(split.data.length, otherSplit.data.length) /
          Math.max(split.data.length, otherSplit.data.length),
      }))
      .sort((a, b) => a.distanceFactor - b.distanceFactor),
  }))

  const sortByMatchedSplit:
    | ((a: MatchedSplit, b: MatchedSplit) => number)
    | undefined = (a, b) =>
    b.otherSplitMatches[0] && a.otherSplitMatches[0]
      ? b.otherSplitMatches[0].distanceFactor -
        a.otherSplitMatches[0].distanceFactor
      : 0

  matchedSplits.sort(sortByMatchedSplit)

  const assignedIndexes = new Set<number>()
  const matched = matchedSplits
    .map(({ split, otherSplitMatches }, i) => {
      // the most distant split does not have a match if the number of splits are different
      if (i < splitsDifference) {
        return { split, matchingSplit: undefined, otherSplitMatches: [] }
      }

      const bestMatch = otherSplitMatches.find(
        ({ sizeRatio, split: { index } }) =>
          sizeRatio >= prioritizeSizeRatioAbove && !assignedIndexes.has(index),
      )
      if (bestMatch) {
        assignedIndexes.add(bestMatch.split.index)
      }
      return {
        split,
        matchingSplit: bestMatch?.split,
        otherSplitMatches: otherSplitMatches.filter(
          ({ sizeRatio }) => sizeRatio < prioritizeSizeRatioAbove,
        ),
      }
    })
    .sort(sortByMatchedSplit)
    .map(({ split, matchingSplit, otherSplitMatches: remainingMatches }) => {
      if (matchingSplit) {
        return { split, bestMatch: matchingSplit }
      }
      let bestMatch = remainingMatches.shift()
      if (bestMatch && !assignedIndexes.has(bestMatch.split.index)) {
        assignedIndexes.add(bestMatch.split.index)
      } else {
        bestMatch = undefined
      }
      return { split, bestMatch: bestMatch?.split }
    })
    .sort((a, b) => a.split.mean - b.split.mean)
    .map(({ split, bestMatch }) =>
      split.source === 1
        ? ([split, bestMatch] as const)
        : ([bestMatch, split] as const),
    )
  return matched
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
