import { Kolmogorov } from './distributions.js'
import { Vector } from './vector.js'

/*
 * Two-sample Kolmogorov-Smirnov test
 */
export function kolmogorovSmirnov(
  xData: number[] | Vector,
  yData: number[] | Vector,
): { d: number; ks: number; p: number } {
  const x = new Vector(xData)
  const y = new Vector(yData)
  const all = new Vector([...x.elements, ...y.elements]).sort()
  const ecdfx = x.ecdf(all)
  const ecdfy = y.ecdf(all)
  const d = ecdfy.subtract(ecdfx).abs().max()
  const n = (x.length() * y.length()) / (x.length() + y.length())
  const ks = Math.sqrt(n) * d
  const p = 1 - new Kolmogorov().distr(ks)
  return {
    d,
    ks,
    p,
  }
}
