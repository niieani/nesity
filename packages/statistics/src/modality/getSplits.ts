import { DEFAULT_MODALITY_SPLIT_TO_NOISE_RATIO } from '../compare/defaults.js'
import {
  SplitMultiModalDistributionConfig,
  splitMultimodalDistributionUsingKernelDensityEstimation,
} from './splitMultimodalDistributionWithKDE.js'
import {
  splitMultimodalDistribution,
  SplitMultimodalDistributionWithQuantilesOptions,
} from './splitMultimodalDistributionWithQuantiles.js'

export interface GetSplitsReturnType {
  rawSplitsSortedBySize: readonly number[][]
  rawSplits: readonly number[][]
  largestSplitIndex: number
  splitsAndTheirDistribution: readonly (readonly [number[], number])[]
  separateModalitySizeThreshold: number
  modalityCount: number
  modalities: readonly number[][]
  largestModalityIndex: number
}

export interface GetSplitsCommonOptions {
  sortedData: number[]
  getSeparateModalitySizeThreshold?: (splitsCount: number) => number
}

export const DEFAULT_GET_SEPARATE_MODALITY_SIZE_THRESHOLD = (
  splitsCount: number,
) => (1 / splitsCount) * DEFAULT_MODALITY_SPLIT_TO_NOISE_RATIO

export function getSplits({
  rawSplits,
  sortedData,
  // by default, at least 80% of the data must be in a split to count as a separate modality
  getSeparateModalitySizeThreshold = DEFAULT_GET_SEPARATE_MODALITY_SIZE_THRESHOLD,
}: GetSplitsCommonOptions & {
  rawSplits: number[][]
}): GetSplitsReturnType {
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

export const getSplitsWithKDE = ({
  sortedData,
  getSeparateModalitySizeThreshold,
  bandwidth,
  threshold,
  ...rest
}: Pick<
  SplitMultiModalDistributionConfig,
  'kernelStretchFactor' | 'noiseValuesPerSample' | 'random' | 'iterations'
> & {
  bandwidth: number
  threshold: number
} & GetSplitsCommonOptions) => {
  const rawSplits = splitMultimodalDistributionUsingKernelDensityEstimation({
    sortedData,
    getBandwidth: () => bandwidth,
    getThreshold: () => threshold,
    ...rest,
  })
  return getSplits({
    rawSplits,
    getSeparateModalitySizeThreshold,
    sortedData,
  })
}

export const getSplitsWithQuantiles = ({
  sortedData,
  getSeparateModalitySizeThreshold,
  ...options
}: GetSplitsCommonOptions &
  SplitMultimodalDistributionWithQuantilesOptions) => {
  const rawSplits = splitMultimodalDistribution({
    sortedData,
    ...options,
  })
  return getSplits({
    rawSplits,
    getSeparateModalitySizeThreshold,
    sortedData,
  })
}
