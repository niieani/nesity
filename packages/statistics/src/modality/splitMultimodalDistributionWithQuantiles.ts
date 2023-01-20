import {
  consecutiveRatios,
  findSharpChangeQuantile,
  quantile,
} from '../utilities'

const DEFAULT_REFERENCE_RATIO_QUANTILE = 0.8
const DEFAULT_SPLIT_WHEN_CHANGE_IS_THIS_MANY_TIMES_LARGER_THAN_REFERENCE_RATIO = 3

export const splitMultimodalDistribution = ({
  data,
  splitWhenChangeIsThisManyTimesLargerThanReferenceRatio = DEFAULT_SPLIT_WHEN_CHANGE_IS_THIS_MANY_TIMES_LARGER_THAN_REFERENCE_RATIO,
  referenceRatioQuantile = DEFAULT_REFERENCE_RATIO_QUANTILE,
}: {
  data: number[]
  splitWhenChangeIsThisManyTimesLargerThanReferenceRatio?: number
  referenceRatioQuantile?: number
}) => {
  // since we deal with ratios, we need to shift the data so that the lowest value is 0
  const lowestValue = Math.min(...data)
  const positiveData = lowestValue < 0 ? data.map((d) => d + lowestValue) : data
  // ratios will disproportionally mark changes in the lower part of the distribution
  // i.e. change between 100 and 200 is 2x, but change between 1000 and 1100 is only 1.1x
  // we correct for this by further shifting the data by the median value
  const median = quantile({ data: positiveData, q: 0.5 })
  const dataPlusMedian = positiveData.map((d) => d + median)

  const ratios = consecutiveRatios(dataPlusMedian)
  const { qValue: sharpChangeValue } = findSharpChangeQuantile({
    data: ratios,
  })
  const pRatio = quantile({ data: ratios, q: referenceRatioQuantile })
  // we subtract from 1, because all distances
  // are guaranteed to be >= 1, as the underlying data is sorted before ratios are calculated
  const distanceRatio = (1 - sharpChangeValue) / (1 - pRatio)
  if (distanceRatio < splitWhenChangeIsThisManyTimesLargerThanReferenceRatio) {
    return [data]
  }
  let lastSplitIndex = 0
  const splits = ratios.flatMap((ratio, index) => {
    const lastSplit = ratios.length - 1 === index
    if (ratio < sharpChangeValue && !lastSplit) {
      return []
    }
    const nextIndex = index + 1 + (lastSplit ? 1 : 0)
    const split = data.slice(lastSplitIndex, nextIndex)
    lastSplitIndex = nextIndex
    return [split]
  })
  return splits
}
