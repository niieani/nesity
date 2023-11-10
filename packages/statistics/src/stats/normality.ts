/* eslint-disable no-magic-numbers */
import { StandardNormal } from './distributions.js'
import { Vector } from './vector.js'

/**
 * It calculates a value g based on the Shapiro-Wilk w statistic. This calculation differs depending on whether n (the sample size) is less than 12.
 * For smaller samples, it uses a different approximation that involves a logarithmic transformation of the w statistic.
 * The variables mu and sigma are calculated using a polynomial function of the sample size (n) or its logarithm (u).
 * These values are part of the approximation for the distribution of the w statistic.
 * It computes a standard score (z) by subtracting mu from g and dividing by sigma.
 * It creates an instance of StandardNormal to use its distr method, which should provide the cumulative distribution function for the standard normal distribution.
 * Finally, it calculates the p-value as one minus the cumulative distribution function value of z.
 */
export function shapiroWilk(vector: number[] | Vector): {
  w: number
  p: number
} {
  const x = vector instanceof Vector ? vector : new Vector(vector)

  const xx = x.sort()
  const n = x.length()
  const u = 1 / Math.sqrt(n)

  // m
  const sn = new StandardNormal()
  const m = new Vector([])
  for (let i = 1; i <= n; i++) {
    m.push(sn.inverse((i - 3 / 8) / (n + 1 / 4)))
  }

  // c
  const md = m.dot(m)
  const c = m.multiply(1 / Math.sqrt(md))

  // a
  const an =
    -2.706_056 * u ** 5 +
    4.434_685 * u ** 4 -
    2.071_19 * u ** 3 -
    0.147_981 * u ** 2 +
    0.221_157 * u +
    c.elements[n - 1]!
  const ann =
    -3.582_633 * u ** 5 +
    5.682_633 * u ** 4 -
    1.752_461 * u ** 3 -
    0.293_762 * u ** 2 +
    0.042_981 * u +
    c.elements[n - 2]!

  const phi =
    n > 5
      ? (md - 2 * m.elements[n - 1]! ** 2 - 2 * m.elements[n - 2]! ** 2) /
        (1 - 2 * an ** 2 - 2 * ann ** 2)
      : (md - 2 * m.elements[n - 1]! ** 2) / (1 - 2 * an ** 2)

  const a = new Vector([])
  if (n > 5) {
    a.push(-an)
    // eslint-disable-next-line unicorn/no-array-push-push
    a.push(-ann)
    for (let i = 2; i < n - 2; i++) {
      a.push(m.elements[i]! * phi ** (-1 / 2))
    }
    a.push(ann)
    // eslint-disable-next-line unicorn/no-array-push-push
    a.push(an)
  } else {
    a.push(-an)
    for (let i = 1; i < n - 1; i++) {
      a.push(m.elements[i]! * phi ** (-1 / 2))
    }
    a.push(an)
  }

  // w
  const w = xx.res().multiply(a).sum() ** 2 / xx.ss()

  // p
  let g: number
  let mu: number
  let sigma: number
  if (n < 12) {
    const gamma = 0.459 * n - 2.273
    g = -Math.log(gamma - Math.log(1 - w))
    mu = -0.000_671_4 * n ** 3 + 0.025_054 * n ** 2 - 0.399_78 * n + 0.544
    sigma = Math.exp(
      -0.002_032_2 * n ** 3 + 0.062_767 * n ** 2 - 0.778_57 * n + 1.382_2,
    )
  } else {
    // eslint-disable-next-line @typescript-eslint/no-shadow
    const u = Math.log(n)
    g = Math.log(1 - w)
    mu = 0.003_891_5 * u ** 3 - 0.083_751 * u ** 2 - 0.310_82 * u - 1.585_1
    sigma = Math.exp(0.003_030_2 * u ** 2 - 0.082_676 * u - 0.480_3)
  }

  const z = (g - mu) / sigma
  const norm = new StandardNormal()
  const p = 1 - norm.distr(z)

  return { w, p }
}
