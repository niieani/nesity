/* eslint-disable no-magic-numbers */

import * as utilities from './utilities'

export const DEFAULT_KERNEL_STRETCH_FACTOR = 1.3
export const DEFAULT_QUANTILE_PRECISION = 0.01
export const DEFAULT_MINIMUM_VELOCITY_TO_FIRST_QUARTILE_RATIO = 0.25

export type GetBandwidthConfig = utilities.DataOrSortedData & {
  threshold?: number
}

export interface KernelDensityEstimateConfigBase {
  kernelStretchFactor?: number
  getThreshold?: (config: utilities.DataOrSortedData) => number
  getBandwidth?: (config: GetBandwidthConfig) => number
  densityFunction?: (x: number) => number
}

export type KernelDensityEstimateConfig = KernelDensityEstimateConfigBase &
  utilities.DataOrSortedData

// https://www.real-statistics.com/distribution-fitting/kernel-density-estimation/
export const ProbabilityDensityFunctions = {
  // probability density function of a normal distribution
  Gaussian: (x: number) => Math.exp(-0.5 * x ** 2) / Math.sqrt(2 * Math.PI),
  Epanechnikov: (x: number) => (3 * (1 - x ** 2)) / 4,
  Silverman: (x: number) =>
    Math.exp(-(Math.abs(x) / Math.sqrt(2))) *
    Math.sin(Math.abs(x) / (Math.sqrt(2) + Math.PI / 4)),
  triangular: (x: number) => 1 - Math.abs(x),
  biweight: (x: number) => (15 * (1 - x ** 2) ** 2) / 16,
  triweight: (x: number) => (35 * (1 - x ** 2) ** 3) / 32,
  tricube: (x: number) => (70 * (1 - Math.abs(x) ** 3) ** 3) / 81,
  cosine: (x: number) => (Math.PI / 4) * Math.cos((1 - Math.PI * x) / 2),
}

export const calculateSilvermansRuleOfThumbBandwidth = ({
  data,
  sortedData = utilities.sort(data!),
  threshold = utilities.stdev({ sortedData }),
}: GetBandwidthConfig) =>
  // also possible to use this alternative simplified version (see Wikipedia):
  // 1.06 * stdev * sortedData.length ** (-1 / 5)
  0.9 *
  Math.min(threshold, utilities.interQuartileRange({ sortedData }) / 1.34) *
  sortedData.length ** (-1 / 5)

export interface OptimalThresholdConfigBase {
  precisionDelta?: number
  minimumVelocityToFirstQuartileRatio?: number
}

export type OptimalThresholdConfig = utilities.DataOrSortedData &
  OptimalThresholdConfigBase & {
    stdev?: number
  }

/**
 * a custom KDE threshold estimator
 */
export function optimalThreshold({
  data,
  sortedData = utilities.sort(data!),
  precisionDelta = DEFAULT_QUANTILE_PRECISION,
  minimumVelocityToFirstQuartileRatio = DEFAULT_MINIMUM_VELOCITY_TO_FIRST_QUARTILE_RATIO,
  stdev = utilities.stdev({ sortedData }),
}: OptimalThresholdConfig): {
  p: number
  value: number
  stdev: number
} {
  const distances = utilities.distances(sortedData).map(Math.abs)
  const q1 = utilities.quantile({
    sortedData,
    q: utilities.FIRST_QUARTILE,
  })

  let p = 1
  let distance = utilities.quantile({ data: distances, q: p })
  let lastMatchingValue: { p: number; value: number } | undefined

  // iterating from the top, find the lowest quantile with the sharpest change in distance
  do {
    const prevP = p - precisionDelta
    const prevDistance = utilities.quantile({ data: distances, q: prevP })
    const changeVelocity = Math.abs(prevDistance - distance)
    const changeVelocityToFirstQuartileRatio = changeVelocity / q1
    if (
      changeVelocityToFirstQuartileRatio > minimumVelocityToFirstQuartileRatio
    ) {
      lastMatchingValue = {
        p,
        value: distance,
      }
    }
    p = prevP
    distance = prevDistance
  } while (p >= utilities.THIRD_QUARTILE)

  if (!lastMatchingValue) {
    return {
      p: Number.NaN,
      // use standard deviation as a fallback
      value: stdev,
      stdev,
    }
  }

  return {
    ...lastMatchingValue,
    stdev,
  }
}

/**
 * See https://mathisonian.github.io/kde/
 */
export function kernelDensityEstimate({
  data,
  sortedData = utilities.sort(data!),
  kernelStretchFactor = DEFAULT_KERNEL_STRETCH_FACTOR,
  densityFunction = ProbabilityDensityFunctions.Gaussian,
  getThreshold = (d) => optimalThreshold(d).value,
  getBandwidth = calculateSilvermansRuleOfThumbBandwidth,
}: KernelDensityEstimateConfig): number[] {
  const sampleCount = sortedData.length
  const threshold = getThreshold({ sortedData })

  // https://en.wikipedia.org/wiki/Kernel_density_estimation#A_rule-of-thumb_bandwidth_estimator
  // calculate bandwidth using Silverman's rule of thumb (normal distribution approximation, Gaussian approximation)
  const bandwidth = getBandwidth({ threshold, sortedData })

  const scaledBandwidth = bandwidth * kernelStretchFactor

  // kernel density estimation, think about this like making a histogram from input values
  const kde: number[] = []
  for (let i = 0; i < sampleCount; i++) {
    let sum = 0
    for (let j = 0; j < sampleCount; j++) {
      sum +=
        (1 / scaledBandwidth) *
        densityFunction((sortedData[i]! - sortedData[j]!) / scaledBandwidth)
    }
    kde[i] = sum / sampleCount
  }
  return kde
}
