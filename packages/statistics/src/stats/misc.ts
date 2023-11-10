/* eslint-disable no-magic-numbers */
import { adaptiveSimpson } from './numeric.js'

/*
 * factorial
 */
export function factorial(n: number): number {
  if (n < 0) {
    throw new Error('Factorial of negative number is not defined.')
  }

  let result = 1
  for (let i = 2; i <= n; i++) {
    result *= i
  }
  return result
}

/*
 * error function
 */
export function erf(z: number, precision = 1e-12): number {
  let term: number
  let sum = 0
  let n = 0

  // The do...while loop in the erf function uses a condition that checks if the term is greater than 1e-11 to decide if it should continue iterating.
  // This precision can be adjusted if necessary.
  do {
    term = ((-1) ** n * z ** (2 * n + 1)) / factorial(n) / (2 * n + 1)
    sum += term
    n++
  } while (Math.abs(term) > precision)
  return (sum * 2) / Math.sqrt(Math.PI)
}

/*
 * gamma function
 * The gamma function includes the Lanczos approximation coefficients and uses recursion for the argument less than 0.5.
 */
export function gamma(n: number): number {
  const p = [
    0.999_999_999_999_809_93, 676.520_368_121_885_1, -1_259.139_216_722_402_8,
    771.323_428_777_653_13, -176.615_029_162_140_59, 12.507_343_278_686_905,
    -0.138_571_095_265_720_12, 9.984_369_578_019_571_6e-6,
    1.505_632_735_149_311_6e-7,
  ] as const
  const g = 7
  if (n < 0.5) {
    return Math.PI / (Math.sin(Math.PI * n) * gamma(1 - n))
  }
  // eslint-disable-next-line no-param-reassign
  n -= 1
  let a = p[0]
  const t = n + g + 0.5
  for (let i = 1; i < p.length; i++) {
    a += p[i]! / (n + i)
  }
  return Math.sqrt(2 * Math.PI) * t ** (n + 0.5) * Math.exp(-t) * a
}

/*
 * beta function
 */
export function beta(x: number, y: number): number {
  return (gamma(x) * gamma(y)) / gamma(x + y)
}

/*
 * incomplete beta function
 */
export function ibeta(x: number, a: number, b: number): number {
  return adaptiveSimpson(
    (y: number) => y ** (a - 1) * (1 - y) ** (b - 1),
    0,
    x,
    1e-11,
    10,
  )
}

/*
 * regularized incomplete beta function
 */
export function rbeta(x: number, a: number, b: number): number {
  return ibeta(x, a, b) / beta(a, b)
}
