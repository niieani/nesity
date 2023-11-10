import { F } from './distributions.js'
import { Factor } from './factor.js'
import { Vector } from './vector.js'

interface AnovaResult {
  tdf: number // Total degrees of freedom
  tss: number // Total sum of squares
  tms: number // Total mean squares
  edf: number // Error degrees of freedom
  ess: number // Error sum of squares
  ems: number // Error mean squares
  f: number // F-statistic
  p: number // P-value
}

export function oneWayANOVA(x: Factor, y: Vector): AnovaResult {
  const vectors: Vector[] = []
  for (let i = 0; i < x.groups(); i++) {
    const v: Vector = new Vector()
    const indices: number[] = x.group(i)
    for (const idx of indices) {
      v.push(y.elements[idx]!)
    }
    vectors.push(v)
  }
  const mean = new Vector()
  const n = new Vector()
  const v = new Vector()
  for (const vector of vectors) {
    mean.push(vector.mean())
    n.push(vector.length())
    v.push(vector.variance())
  }
  const tdf = x.groups() - 1
  const tss = mean.add(-y.mean()).pow(2).multiply(n).sum()
  const tms = tss / tdf
  const edf = x.length() - x.groups()
  const ess = v.multiply(n.add(-1)).sum()
  const ems = ess / edf
  const f = tms / ems
  const fdistr = new F(tdf, edf)
  const p = 1 - fdistr.distr(Math.abs(f))
  return {
    tdf,
    tss,
    tms,
    edf,
    ess,
    ems,
    f,
    p,
  }
}
