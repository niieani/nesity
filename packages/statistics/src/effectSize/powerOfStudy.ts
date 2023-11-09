/* eslint-disable no-magic-numbers */
import { normal } from 'jstat'
import { uniroot } from '../vendor/uniroot.js'

type TailType = 'one-tailed' | 'two-tailed'

/**
 *
 * @param alpha Significance level
 * @param d Effect size
 * @param n Sample size
 * @param config one or two-tailed
 * @returns Actual power of study
 */
function getPower({
  alpha,
  d,
  sampleSize,
  config = 'two-tailed',
}: {
  alpha: number
  d: number
  sampleSize: number
  config?: TailType
}): number {
  const finalAlpha = config === 'one-tailed' ? alpha : alpha / 2
  const std = 1 / Math.sqrt(sampleSize)
  const power =
    1 -
    normal.cdf(
      normal.inv(1 - finalAlpha, 0, 1) * (1 / Math.sqrt(sampleSize)),
      d,
      std,
    )

  if (config === 'one-tailed') {
    return power
  }
  const lwr = normal.cdf(
    -1 * (normal.inv(1 - finalAlpha, 0, 1) * (1 / Math.sqrt(sampleSize))),
    d,
    std,
  )
  return power + lwr
}

/**
 * https://rpsychologist.com/d3/nhst/
 * @param power Power of Study (1-β = 0.8), e.g. 0.8
 * @param alpha Significance level (e.g. 0.05)
 * @param d Effect size (e.g. 0.63)
 * @returns
 */
function getSampleSize({
  power,
  alpha,
  d,
  config = 'two-tailed',
}: {
  power: number
  alpha: number
  d: number
  config?: TailType
}) {
  const f = (n: number) => getPower({ alpha, d, sampleSize: n, config }) - power
  const n = uniroot(f, 1, 1e6)
  return n
}

/**
 * Returns the effect size (Cohen's d) from provided parameters
 */
function getEffectSize({
  alpha,
  power,
  sampleSize,
  config = 'two-tailed',
}: {
  alpha: number
  power: number
  sampleSize: number
  config?: TailType
}) {
  const f = (d: number) => getPower({ alpha, d, sampleSize, config }) - power
  const d = uniroot(f, 1e-10, 10)
  return d
}

function getAlpha({
  power,
  sampleSize,
  d,
  config = 'two-tailed',
}: {
  power: number
  sampleSize: number
  d: number
  config?: TailType
}) {
  const f = (alpha: number) =>
    getPower({ alpha, d, sampleSize, config }) - power
  const a = uniroot(f, 1e-10, 1 - 1e-10)
  return a
}

export function calculatePowerOfStudy({
  actualSampleSize,
  d,
  desiredAlpha,
  desiredPower,
  config = 'two-tailed',
}: {
  actualSampleSize: number
  // https://rpsychologist.com/cohend/
  /** Cohen's D, which is the actual Effect Size */
  d: number
  desiredAlpha: number
  desiredPower: number
  config?: TailType
}) {
  const actualAlpha = getAlpha({
    power: desiredPower,
    sampleSize: actualSampleSize,
    d,
    config,
  })
  const actualEffectSize = getEffectSize({
    alpha: desiredAlpha,
    power: desiredPower,
    sampleSize: actualSampleSize,
    config,
  })
  // Calculate the sample size needed to achieve the desired power
  const desiredSampleSize = getSampleSize({
    power: desiredPower,
    alpha: desiredAlpha,
    d,
    config,
  })
  const actualPowerOfStudy = getPower({
    alpha: desiredAlpha,
    d,
    sampleSize: actualSampleSize,
    config,
  })

  return {
    actualPowerOfStudy,
    actualAlpha,
    actualEffectSize,
    desiredSampleSize,
    typeTwoErrorProbability: 1 - desiredPower,
    typeOneErrorProbability: desiredAlpha,
  }
}
