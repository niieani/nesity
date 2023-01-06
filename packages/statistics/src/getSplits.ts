import { DEFAULT_MODALITY_SPLIT_TO_NOISE_RATIO } from './compare'
import {
  splitMultimodalDistribution,
  SplitMultiModalDistributionConfig,
} from './splitMultimodalDistribution'

export interface GetSplitsReturnType {
  rawSplitsSortedBySize: number[][]
  rawSplits: number[][]
  largestSplitIndex: number
  splitsAndTheirDistribution: (readonly [number[], number])[]
  separateModalitySizeThreshold: number
  modalityCount: number
  modalities: number[][]
  largestModalityIndex: number
}

export function getSplits({
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
