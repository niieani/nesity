import { T } from './distributions.js'
import { Vector } from './vector.js'

interface RegressionResult {
  n: number
  slope: number
  intercept: number
  rse: number
  slope_se: number
  slope_t: number
  slope_p: number
  intercept_se: number
  intercept_t: number
  intercept_p: number
  rs: number
}

export function linear(x: Vector, y: Vector): RegressionResult {
  const n = x.length()
  const mx = x.mean()
  const my = y.mean()

  // Calculate differences from the means
  const rx = x.subtract(mx)
  const ry = y.subtract(my)

  // Compute the sum of squares
  const ssxx = rx.dot(rx)
  const ssyy = ry.dot(ry)
  const ssxy = rx.dot(ry)

  // Calculate regression coefficients
  const slope = ssxy / ssxx
  const intercept = my - slope * mx

  // Calculate predictions and residuals
  const yHat = x.multiply(slope).add(intercept)
  const residuals = y.subtract(yHat)
  const ssr = residuals.dot(residuals)

  // Calculate standard errors, t-stats, and p-values
  const rse = Math.sqrt(ssr / (n - 2))
  const tDist: T = new T(n - 2)
  const slopeSe = rse / Math.sqrt(ssxx)
  const slopeT = slope / slopeSe
  const slopeP = 2 * (1 - tDist.distr(Math.abs(slopeT)))
  const interceptSe = rse * Math.sqrt(1 / n + (mx * mx) / ssxx)
  const interceptT = intercept / interceptSe
  const interceptP = 2 * (1 - tDist.distr(Math.abs(interceptT)))

  // Calculate R-squared
  const rs = ssxy ** 2 / (ssxx * ssyy)

  return {
    n,
    slope,
    intercept,
    rse,
    slope_se: slopeSe,
    slope_t: slopeT,
    slope_p: slopeP,
    intercept_se: interceptSe,
    intercept_t: interceptT,
    intercept_p: interceptP,
    rs,
  }
}
