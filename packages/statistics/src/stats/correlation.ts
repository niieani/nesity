import { T } from './distributions.js'
import { Vector } from './vector.js'

export function pearson(
  x: Vector,
  y: Vector,
): { r: number; t: number; df: number; p: number } {
  const n = x.length()
  const mx = x.mean()
  const my = y.mean()
  const r =
    x.add(-mx).multiply(y.add(-my)).sum() /
    Math.sqrt(x.add(-mx).pow(2).sum() * y.add(-my).pow(2).sum())
  const t = r * Math.sqrt((n - 2) / (1 - r ** 2))
  const df = n - 2
  const tdistr = new T(df)
  const p = 2 * (1 - tdistr.distr(Math.abs(t)))

  return { r, t, df, p }
}
