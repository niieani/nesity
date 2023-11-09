import type { EffectSizeStats } from '../effectSize/effectSizeStats.js'
import type { OptimalThresholdConfigBase } from '../kernelDensityEstimate.js'
import type { SplitMultiModalDistributionConfig } from '../modality/splitMultimodalDistributionWithKDE.js'
import type { SplitMultimodalDistributionWithQuantilesOptions } from '../modality/splitMultimodalDistributionWithQuantiles.js'
import type { ComparisonQualityWeightingOptions } from './compareSplitPermutations.js'
import type { KDEOptimizationParameters } from './compareWithKDEDenoising.js'
import type { QuantileOptimizationParameters } from './compareWithQuantileDenoising.js'

export interface AllTTests {
  twoSided: TTestResult
  greater: TTestResult
  less: TTestResult
  degreesOfFreedom: number
  tValue: number
}

export interface ComparisonResult {
  outcome: ComparisonOutcome
  outcomeFrequencies?: {
    [outcome in ComparisonOutcome]?: number
  }
  ttest: AllTTests
  ttestAdjusted?: {
    twoSided: TTestResultBase
    greater: TTestResultBase
    less: TTestResultBase
  }
  meanDifference: number
  stdevDifference: number
  pooledVariance: number
  pooledStDev: number
  data1: SampleStatistics
  data2: SampleStatistics
  effectSizeStats: EffectSizeStats
  // present when denoising:
  originalResult?: ComparisonResult
  denoiseSettings?: DenoiseSettings
  // present when multimodal
  comparedModalities1?: SampleStatistics[]
  comparedModalities2?: SampleStatistics[]
  discardedModalities1?: number[][]
  discardedModalities2?: number[][]
  mergedFromMultipleModalities?: boolean
}

export type ConfidenceInterval = readonly [number | null, number | null]

export interface SampleStatistics {
  mean: number
  variance: number
  stdev: number
  /** mean distance from consecutive ordered */
  meanDistanceRatio: number
  normalityProbability: number
  dataCount: number
  data: number[]
  discardedCount: number
  discardedData: number[]
  noiseCount?: number
  modalityCount?: number
  representativeMean?: number
  representativeStdev?: number
}
export interface TTestResultBase {
  pValue: number
  rejected: boolean
}

export interface TTestResult extends TTestResultBase {
  rejected: boolean
  pValue: number
  confidenceInterval: ConfidenceInterval
}

export type DenoiseSettings =
  | QuantileOptimizationParameters
  | KDEOptimizationParameters

export type ComparisonOutcome =
  | 'less'
  | 'greater'
  | 'equal'
  | 'similar'
  | 'invalid'

export type GetOutcomeOptions = {
  requireTwoSidedNullHypothesisRejection: boolean
} & (
  | {
      minimalAbsoluteChangeProbability: number
    }
  | {
      minimalCohensD: number
    }
)

export interface InternalGetOutcomeOptions {
  requireTwoSidedNullHypothesisRejection: boolean
  minimalAbsoluteChangeProbability: number
}

export interface KDEDenoisingOptions
  extends OptimalThresholdConfigBase,
    Pick<
      SplitMultiModalDistributionConfig,
      'noiseValuesPerSample' | 'random' | 'iterations'
    > {
  kernelStretchFactorRange?: readonly [lower: number, upper: number]
  kernelStretchFactorSearchStepSize?: number
}

export interface CompareWithDenoisingOptionsBase {
  data1: number[]
  data2: number[]
  sorted1: number[]
  sorted2: number[]
  stdev1: number
  stdev2: number
  confidenceLevel: number
  getOutcomeOptions: InternalGetOutcomeOptions
  minimalModalitySize: number
  minimumUsedToTotalSamplesRatio: number
  comparisonQualityWeightingOptions?: Partial<ComparisonQualityWeightingOptions>
}

export type DenoisingAndModalitySplittingOptions =
  | {
      type: 'none'
      options?: never
    }
  | {
      type: 'kde'
      options?: KDEDenoisingOptions
    }
  | {
      type: 'quantile'
      options?: SplitMultimodalDistributionWithQuantilesOptions
    }
