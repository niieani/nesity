import { Normal } from './distributions.js'

/**
 * Calculates the required sample size for a study.
 * @param alpha - The significance level used in the hypothesis test.
 * @param power - The probability of correctly rejecting the null hypothesis.
 * @param sd - The standard deviation of the population.
 * @param effect - The effect size of interest.
 * @returns The required sample size.
 */
export function sampleSize(
  alpha: number,
  power: number,
  sd: number,
  effect: number,
): number {
  const n = new Normal(0, 1)
  return (
    (2 * (n.inverse(1 - alpha / 2) + n.inverse(power)) ** 2 * sd ** 2) /
    effect ** 2
  )
}
