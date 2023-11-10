import { T as TDistribution } from './distributions.js'
import { Vector } from './vector.js'

// Define interfaces for the results of the t-tests
interface TwoSampleTTestResult {
  se: number
  t: number
  df: number
  p: number
}

interface OneSampleTTestResult {
  sample: Vector
  mu: number
  se: number
  t: number
  df: number
  p: number
}

// Two-sample Student's t-test
export function twoSampleTTest(
  first: Vector,
  second: Vector,
): TwoSampleTTestResult {
  const meanDiff = first.mean() - second.mean()
  const se = Math.sqrt(
    first.variance() / first.length() + second.variance() / second.length(),
  )
  const t = meanDiff / se
  const df = first.length() + second.length() - 2
  const tdistr = new TDistribution(df)
  const p = 2 * (1 - tdistr.distr(Math.abs(t)))

  return { se, t, df, p }
}

// One-sample Student's t-test
export function oneSampleTTest(
  sample: Vector,
  mu: number,
): OneSampleTTestResult {
  const meanDiff = sample.mean() - mu
  const se = Math.sqrt(sample.variance()) / Math.sqrt(sample.length())
  const t = meanDiff / se
  const df = sample.length() - 1
  const tdistr = new TDistribution(df)
  const p = 2 * (1 - tdistr.distr(Math.abs(t)))

  return { sample, mu, se, t, df, p }
}
