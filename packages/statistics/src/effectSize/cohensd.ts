import jstat from 'jstat'
import * as utils from '../utilities.js'

const { normal } = jstat

/**
 * Overlap
 * Generally called the overlapping coefficient (OVL). Cohen’s d can be converted to OVL using the following formula (Reiser and Faraggi, 1999)
 *
 * OVL=2Φ(−∣δ∣/2)
 * where Φ is the cumulative distribution function of the standard normal distribution, and δ the population Cohen’s d.
 */
export const calcGaussOverlap = (cohensD: number): number =>
  2 * normal.cdf(-Math.abs(cohensD) / 2, 0, 1)

/**
 * Calculates the probability of superiority
 *
 * This is effect size with many names: common language effect size (CL),
 * Area under the receiver operating characteristics (AUC) or just A for its non-parametric version (Ruscio & Mullen, 2012).
 * It is meant to be more intuitive for persons without any training in statistics.
 * The effect size gives the probability that a person picked at random from the treatment group
 * will have a higher score than a person picked at random from the control group.
 * Cohen’s d can be converted CL using the following formula (Ruscio, 2008)
 * CL=Φ(δ/√2)
 * where Φ is the cumulative distribution function of the standard normal distribution, and δ the population Cohen’s d.
 */
export const calcCL = (cohensD: number): number =>
  normal.cdf(cohensD / Math.sqrt(2), 0, 1)

export const calcChangeProbability = (
  probabilityOfSuperiority: number,
): number => probabilityOfSuperiority * 2 - 1

/**
 * Cohen’s U₃
 * Cohen (1977) defined U3 as a measure of non-overlap, where “we take the percentage of the A population
 * which the upper half of the cases of the Β population exceeds”.
 * Cohen’s d can be converted to Cohen’s U3 using the following formula
 * U₃=Φ(δ)
 * where Φ is the cumulative distribution function of the standard normal distribution, and δ the population Cohen’s d.
 */
export const calcU3 = (cohensD: number): number => normal.cdf(cohensD, 0, 1)

/**
 * Cohen's d is a way to determine the effect size of a statistical test.
 * The resulting value is the standardized mean difference,
 * δ=(μ2−μ1)/σ
 * where δ is the population parameter of Cohen’s d. Where it is assumed that σ1=σ2=σ,
 * i.e., homogeneous population variances. And μi is the mean of the respective population.
 */
export const calcCohensD = ({
  data1,
  data2,
  n1 = data1.length,
  n2 = data2.length,
  mean1 = utils.mean(data1),
  mean2 = utils.mean(data2),
  pooledStDev = utils.stdev({
    variance: utils.pooledVariance({
      data1,
      n1,
      data2,
      n2,
      besselsCorrection: true,
    }),
  }),
  // eslint-disable-next-line no-magic-numbers
  correctForSmallSampleSizeWhenBelow = 50,
}: {
  data1: number[]
  data2: number[]
  n1?: number
  n2?: number
  mean1?: number
  mean2?: number
  pooledStDev?: number
  /**
   * The constants 3 and 2.25 in the correction formula are related to the degrees of freedom of the t-distribution.
   * It is worth noting that these constants are not universally accepted, and there is some debate about their appropriate use.
   * It is always a good idea to carefully consider the assumptions underlying any correction that you apply,
   * and to consider whether it is appropriate for your specific research context.
   * @default 50
   */
  correctForSmallSampleSizeWhenBelow?: number
}): number => {
  // n is only used for purposes of correction for small sample size, it cannot be lower than 4
  // eslint-disable-next-line no-magic-numbers
  const n = Math.max(utils.harmonicMean(n1, n2), 4)
  const cohensD = (mean1 - mean2) / pooledStDev
  if (n < correctForSmallSampleSizeWhenBelow) {
    const correctionFactorForSmallSampleSize =
      // eslint-disable-next-line no-magic-numbers
      ((n - 3) / (n - 2.25)) * Math.sqrt((n - 2) / n)
    return cohensD * correctionFactorForSmallSampleSize
  }
  return cohensD
}
