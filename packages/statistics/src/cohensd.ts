import { normal } from 'jstat'

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
 * This is effect size with many names: common language effect size (CL), Area under the receiver operating characteristics (AUC) or just A for its non-parametric version (Ruscio & Mullen, 2012). It is meant to be more intuitive for persons without any training in statistics. The effect size gives the probability that a person picked at random from the treatment group will have a higher score than a person picked at random from the control group. Cohen’s d can be converted CL using the following formula (Ruscio, 2008)
 * CL=Φ(δ/√2)
 * where Φ is the cumulative distribution function of the standard normal distribution, and δ the population Cohen’s d.
 */
export const calcCL = (cohensD: number): number =>
  normal.cdf(cohensD / Math.sqrt(2), 0, 1)

/**
 * Cohen’s U₃
 * Cohen (1977) defined U3 as a measure of non-overlap, where “we take the percentage of the A population which the upper half of the cases of the Β population exceeds”.
 * Cohen’s d can be converted to Cohen’s U3 using the following formula
 * U₃=Φ(δ)
 * where Φ is the cumulative distribution function of the standard normal distribution, and δ the population Cohen’s d.
 */
export const calcU3 = (cohensD: number): number => normal.cdf(cohensD, 0, 1)

/**
 * Cohen’s d is simply the standardized mean difference,
 * δ=(μ2−μ1)/σ
 * where δ is the population parameter of Cohen’s d. Where it is assumed that σ1=σ2=σ,
 * i.e., homogeneous population variances. And μi is the mean of the respective population.
 */
export const calcCohensD = (
  mean1: number,
  mean2: number,
  stDev: number,
): number => (mean1 - mean2) / stDev
