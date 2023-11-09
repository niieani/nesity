import type { EffectSizeStats } from '../effectSize/effectSizeStats.js'
import {
  DEFAULT_CONFIDENCE_LEVEL,
  DEFAULT_MINIMAL_MODALITY_SIZE,
} from './defaults.js'
import { getOutcome } from './getOutcome.js'
import type {
  ComparisonResult,
  InternalGetOutcomeOptions,
  TTestResult,
} from './types.js'

export const mergeComparisonsFromMultipleModalities = ({
  comparisons,
  confidenceLevel = DEFAULT_CONFIDENCE_LEVEL,
  minimalModalitySize = DEFAULT_MINIMAL_MODALITY_SIZE,
  discardedModalities1,
  discardedModalities2,
  getOutcomeOptions,
}: {
  comparisons: ComparisonResult[]
  confidenceLevel?: number
  minimalModalitySize?: number
  discardedModalities1: number[][]
  discardedModalities2: number[][]
  getOutcomeOptions: InternalGetOutcomeOptions
}): ComparisonResult => {
  if (comparisons.length === 0) {
    throw new Error('No comparisons to merge')
  }
  const discardedData1 = discardedModalities1.flat()
  const discardedData2 = discardedModalities2.flat()

  const noise1 = discardedModalities1
    .filter((d) => d.length < minimalModalitySize)
    .flat()
  const noise2 = discardedModalities2
    .filter((d) => d.length < minimalModalitySize)
    .flat()

  const modalityCount1 =
    comparisons.length +
    discardedModalities1.filter((d) => d.length >= minimalModalitySize).length
  const modalityCount2 =
    comparisons.length +
    discardedModalities2.filter((d) => d.length >= minimalModalitySize).length

  if (comparisons.length === 1) {
    return {
      ...comparisons[0]!,
      data1: {
        ...comparisons[0]!.data1,
        discardedCount: discardedData1.length,
        discardedData: discardedData1,
        noiseCount: noise1.length,
      },
      data2: {
        ...comparisons[0]!.data2,
        discardedCount: discardedData2.length,
        discardedData: discardedData2,
        noiseCount: noise2.length,
      },
    }
  }
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
  function mergeTTest(type: 'twoSided' | 'greater' | 'less'): TTestResult {
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

  const effectSizeStats: EffectSizeStats = {
    cohensD: comparisonsWithWeights.reduce(
      (sum, c) => sum + c.effectSizeStats.cohensD * c.weight,
      0,
    ),
    nonOverlapMeasure: comparisonsWithWeights.reduce(
      (sum, c) => sum + c.effectSizeStats.nonOverlapMeasure * c.weight,
      0,
    ),
    overlappingCoefficient: comparisonsWithWeights.reduce(
      (sum, c) => sum + c.effectSizeStats.overlappingCoefficient * c.weight,
      0,
    ),
    probabilityOfSuperiority: comparisonsWithWeights.reduce(
      (sum, c) => sum + c.effectSizeStats.probabilityOfSuperiority * c.weight,
      0,
    ),
    changeProbability: comparisonsWithWeights.reduce(
      (sum, c) => sum + c.effectSizeStats.changeProbability * c.weight,
      0,
    ),
  }

  const { outcome } = getOutcome(
    ttest,
    {
      data1: allUsedData1,
      data2: allUsedData2,
      meanDifference: weightedMeanDifference,
      effectSizeStats,
    },
    getOutcomeOptions,
  )

  const largestSampleSplitComparison = [...comparisonsWithWeights]
    .reverse()
    .sort((a, b) => b.weight - a.weight)[0]!

  const mean1 = comparisonsWithWeights.reduce(
    (sum, c) => sum + c.data1.mean * c.weight1,
    0,
  )
  const mean2 = comparisonsWithWeights.reduce(
    (sum, c) => sum + c.data2.mean * c.weight2,
    0,
  )
  const stdev1 = comparisonsWithWeights.reduce(
    (sum, c) => sum + c.data1.stdev * c.weight1,
    0,
  )
  const stdev2 = comparisonsWithWeights.reduce(
    (sum, c) => sum + c.data2.stdev * c.weight2,
    0,
  )
  return {
    outcome,
    ttest,
    meanDifference: weightedMeanDifference,
    stdevDifference: stdev1 - stdev2,
    pooledVariance: weightedPooledVariance,
    pooledStDev: weightedPooledStDev,
    effectSizeStats,
    data1: {
      data: allUsedData1,
      discardedCount: discardedData1.length,
      discardedData: discardedData1,
      stdev: stdev1,
      mean: mean1,
      // we don't weight the mean, because it would be even more misleading
      // we use the largest sample split instead
      representativeMean: largestSampleSplitComparison.data1.mean,
      representativeStdev: largestSampleSplitComparison.data1.stdev,
      meanDistanceRatio: comparisonsWithWeights.reduce(
        (sum, c) => sum + c.data1.meanDistanceRatio * c.weight1,
        0,
      ),
      normalityProbability: comparisonsWithWeights.reduce(
        (sum, c) => sum + c.data1.normalityProbability * c.weight1,
        0,
      ),
      dataCount: allUsedData1.length,
      variance: comparisonsWithWeights.reduce(
        (sum, c) => sum + c.data1.variance * c.weight1,
        0,
      ),
      modalityCount: modalityCount1,
    },
    data2: {
      data: allUsedData2,
      dataCount: allUsedData2.length,
      discardedCount: discardedData2.length,
      discardedData: discardedData2,
      stdev: stdev2,
      mean: mean2,
      // we don't weight the mean, because it would be even more misleading
      // we use the largest sample split instead
      representativeMean: largestSampleSplitComparison.data2.mean,
      representativeStdev: largestSampleSplitComparison.data2.stdev,
      meanDistanceRatio: comparisonsWithWeights.reduce(
        (sum, c) => sum + c.data2.meanDistanceRatio * c.weight2,
        0,
      ),
      normalityProbability: comparisonsWithWeights.reduce(
        (sum, c) => sum + c.data2.normalityProbability * c.weight2,
        0,
      ),
      variance: comparisonsWithWeights.reduce(
        (sum, c) => sum + c.data2.variance * c.weight2,
        0,
      ),
      modalityCount: modalityCount2,
    },
    comparedModalities1: comparisonsWithWeights.map((c) => c.data1),
    comparedModalities2: comparisonsWithWeights.map((c) => c.data2),
    discardedModalities1,
    discardedModalities2,
    mergedFromMultipleModalities: true,
  }
}
