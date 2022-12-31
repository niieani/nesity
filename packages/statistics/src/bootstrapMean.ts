import * as utilities from './utilities'

export const bootstrapMean = ({
  data,
  targetSamples,
  sampleSize,
  random = Math.random,
}: {
  data: number[]
  targetSamples: number
  sampleSize: number
  random?: () => number
}): number[] =>
  Array.from({ length: targetSamples }, () => {
    // Create a new sample by sampling with replacement from the original data
    const sample = Array.from({ length: sampleSize }, () => {
      const index = Math.floor(random() * data.length)
      return data[index]!
    })

    // Calculate the mean of the sample
    return utilities.mean(sample)
  })
