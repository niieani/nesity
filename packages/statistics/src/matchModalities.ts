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

export function matchModalities({
  rawSplits1,
  rawSplits2,
  meanDistanceWeight = 1,
  // eslint-disable-next-line no-magic-numbers
  sizeRatioWeight = 0.5,
  // eslint-disable-next-line no-magic-numbers
  prioritizeSizeRatioAbove = 0.7,
}: {
  rawSplits1: number[][]
  rawSplits2: number[][]
  meanDistanceWeight?: number
  sizeRatioWeight?: number
  /**
   * If the size of the split is within this ratio of the other split, prioritize the match
   * Otherwise, all splits that do not have the correct ratio will be matched in the 2nd pass
   */
  prioritizeSizeRatioAbove?: number
}) {
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
  const moreSplits = means1.length > means2.length ? means1 : means2
  const fewerSplits = means1.length > means2.length ? means2 : means1
  const splitsDifference = moreSplits.length - fewerSplits.length
  const matchedSplits = moreSplits.map((split) => ({
    split,
    otherSplitMatches: fewerSplits
      .map((otherSplit) => ({
        split: otherSplit,
        // prioritize both mean closeness (1x) and group size ratio (0.5x)
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

export const getModalityData = (
  input:
    | readonly [MappedSplit | undefined, MappedSplit]
    | readonly [MappedSplit, MappedSplit | undefined],
): [number[] | undefined, number[] | undefined] => [
  input[0]?.data,
  input[1]?.data,
]
