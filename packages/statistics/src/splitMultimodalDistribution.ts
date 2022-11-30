import {
  kernelDensityEstimate,
  KernelDensityEstimateConfig,
} from './kernelDensityEstimate'
import * as utilities from './utilities'

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

/**
 * Splits a multimodal dataset into unimodal datasets.
 * Uses kernel density estimation for multimodal distribution detection.
 * See http://adereth.github.io/blog/2014/10/12/silvermans-mode-detection-method-explained/
 */
export function splitMultimodalDistribution(
  config: KernelDensityEstimateConfig,
): number[][] {
  const { data, sortedData = utilities.sort(data!) } = config
  const dataLength = sortedData.length
  const kde = kernelDensityEstimate({
    sortedData,
    ...config,
  })

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

  const split = splitIndexes.map((dataIndex, i) =>
    sortedData.slice(i > 0 ? splitIndexes[i - 1] : 0, dataIndex),
  )

  return split
}
