import {
  calculateSilvermansRuleOfThumbBandwidth,
  kernelDensityEstimate,
  KernelDensityEstimateConfig,
  KernelDensityEstimateConfigBase,
  optimalThreshold,
} from './kernelDensityEstimate'
import * as utilities from './utilities'

export interface SplitMultiModalDistributionConfigBase
  extends KernelDensityEstimateConfigBase {
  noiseValuesPerSample?: number
  random?: () => number
  iterations?: number
}

export type SplitMultiModalDistributionConfig =
  SplitMultiModalDistributionConfigBase & utilities.DataOrSortedData

export type NoiseOptions = Pick<
  SplitMultiModalDistributionConfig,
  | 'getBandwidth'
  | 'getThreshold'
  | 'noiseValuesPerSample'
  | 'random'
  | 'data'
  | 'sortedData'
>

export function getLocalMaxima(config: KernelDensityEstimateConfig): number[] {
  const { data, sortedData = utilities.sort(data!) } = config
  const dataLength = sortedData.length
  const kde = kernelDensityEstimate({
    sortedData,
    ...config,
  })
  // find local maxima
  const localMaxima: number[] = []
  for (let i = 1; i < dataLength - 1; i++) {
    if (kde[i]! > kde[i - 1]! && kde[i]! > kde[i + 1]!) {
      localMaxima.push(sortedData[i]!)
    }
  }
  return localMaxima
}

export function generateNoise({
  data,
  sortedData = utilities.sort(data!),
  getThreshold = (d) => optimalThreshold(d).value,
  getBandwidth = calculateSilvermansRuleOfThumbBandwidth,
  noiseValuesPerSample = 0,
  random = Math.random,
}: NoiseOptions) {
  if (noiseValuesPerSample === 0) {
    return []
  }
  const stdev = utilities.stdev({ sortedData })
  const threshold = getThreshold({ sortedData })
  const bandwidth = getBandwidth({ threshold, sortedData })

  // The noiseMultiplier is used to adjust the bandwidth of the kernel function based on the standard deviation of the input data.
  // When the standard deviation is large, the noiseMultiplier will be small, which will reduce the bandwidth of the kernel function
  // and produce a wiggly density estimate. Conversely, when the standard deviation is small, the noiseMultiplier will be large,
  // which will increase the bandwidth of the kernel function and produce a smoother density estimate.
  // This is useful because it allows the kernel density estimate to adapt to the underlying structure of the data.
  // When the data is more spread out, a smaller bandwidth is more appropriate to capture the details of the distribution.
  // When the data is more concentrated, a larger bandwidth is more appropriate to smooth out the noise in the data.
  const noiseMultiplier = 1 / Math.sqrt(1 + bandwidth ** 2 / stdev ** 2)
  return sortedData.flatMap((x) => {
    const noisyData = Array.from({ length: noiseValuesPerSample }).map(() => {
      // eslint-disable-next-line no-magic-numbers
      const noise = (random() - 0.5) * 2
      return noiseMultiplier * (x + bandwidth * noise)
    })
    return noisyData
  })
}

function getSplitIndexes({
  kde,
  sortedData,
}: {
  kde: number[]
  sortedData: number[]
}) {
  const dataLength = sortedData.length
  const splitIndexes: number[] = []
  for (let i = 1; i < dataLength - 1; i++) {
    if (kde[i]! < kde[i - 1]! && kde[i]! < kde[i + 1]!) {
      const dataIndex = i
      const differenceBetweenPrevious = Math.abs(
        sortedData[dataIndex]! - sortedData[dataIndex - 1]!,
      )
      const differenceBetweenNext = Math.abs(
        sortedData[dataIndex]! - sortedData[dataIndex + 1]!,
      )
      const differenceBetweenPreviousIsBigger =
        differenceBetweenPrevious >= differenceBetweenNext

      const splitIndex = differenceBetweenPreviousIsBigger
        ? dataIndex
        : dataIndex + 1
      splitIndexes.push(splitIndex)
    }
  }

  splitIndexes.push(dataLength)
  return splitIndexes
}

/**
 * Splits a multimodal dataset into unimodal datasets.
 * Uses kernel density estimation for multimodal distribution detection.
 * See http://adereth.github.io/blog/2014/10/12/silvermans-mode-detection-method-explained/
 */
export function splitMultimodalDistribution(
  config: SplitMultiModalDistributionConfig,
): number[][] {
  const {
    data,
    sortedData = utilities.sort(data!),
    iterations = 1,
    ...rest
  } = config

  function iterate() {
    const noise = generateNoise({
      ...rest,
      sortedData,
    })
    const dataWithNoise = utilities.sort([...sortedData, ...noise])
    const splitIndexes: number[] = getSplitIndexes({
      kde: kernelDensityEstimate({
        ...rest,
        sortedData: dataWithNoise,
      }),
      sortedData: dataWithNoise,
    })

    // filter out noise from final splits
    const splits = splitIndexes
      .map((dataIndex, i) =>
        dataWithNoise
          .slice(i > 0 ? splitIndexes[i - 1] : 0, dataIndex)
          .filter((dataOrNoise) => {
            // remove noise from final splits
            const noiseIndex = noise.indexOf(dataOrNoise)
            if (noiseIndex === -1) return true
            noise.splice(noiseIndex, 1)
            return false
          }),
      )
      .filter((split) => split.length > 0)

    return splits
  }

  const splitIterations = Array.from({ length: iterations }, iterate)

  const bestSplits = utilities.mostCommonBy(splitIterations, (splits) =>
    splits.map((split) => split.join('-')).join('|'),
  )

  const [bestSplit = splitIterations[0]!] = bestSplits

  return bestSplit
}
