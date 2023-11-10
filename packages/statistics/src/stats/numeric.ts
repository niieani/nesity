/* eslint-disable no-magic-numbers */
/* eslint-disable @typescript-eslint/no-shadow */
/**
 * Performs adaptive Simpson's rule for numerical integration.
 * @param f - The function to integrate.
 * @param a - The lower limit of integration.
 * @param b - The upper limit of integration.
 * @param eps - The tolerance/accuracy desired.
 * @param depth - The maximum recursion depth.
 * @returns The approximate integral of the function from a to b.
 */
export function adaptiveSimpson(
  f: (y: number) => number,
  a: number,
  b: number,
  eps: number,
  depth: number,
): number {
  const c = (a + b) / 2
  const h = b - a
  const fa = f(a)
  const fb = f(b)
  const fc = f(c)
  const s = (h / 6) * (fa + 4 * fc + fb)

  // Recursive function to perform the actual computation
  function recursive(
    f: (y: number) => number,
    a: number,
    b: number,
    eps: number,
    s: number,
    fa: number,
    fb: number,
    fc: number,
    depth: number,
  ): number {
    const c = (a + b) / 2
    const h = b - a
    const d = (a + c) / 2
    const e = (c + b) / 2
    const fd = f(d)
    const fe = f(e)
    const left = (h / 12) * (fa + 4 * fd + fc)
    const right = (h / 12) * (fc + 4 * fe + fb)
    const s2 = left + right

    // Check if the current approximation meets the tolerance level
    if (depth <= 0 || Math.abs(s2 - s) <= 15 * eps) {
      // Combine the left and right approximations and add a correction term
      return s2 + (s2 - s) / 15
    }
    // Recurse for both halves of the interval
    return (
      recursive(f, a, c, eps / 2, left, fa, fc, fd, depth - 1) +
      recursive(f, c, b, eps / 2, right, fc, fb, fe, depth - 1)
    )
  }

  return recursive(f, a, b, eps, s, fa, fb, fc, depth)
}

/**
 * Root finding using bisection method.
 * @param f - The function whose root is sought.
 * @param a - The lower bound of the interval.
 * @param b - The upper bound of the interval.
 * @param eps - The tolerance/accuracy desired.
 * @returns A root of the function f within the interval [a, b].
 */
export function bisection(
  f: (x: number) => number,
  a: number,
  b: number,
  eps: number = 1e-9,
): number {
  while (Math.abs(a - b) > eps) {
    if (f(a) * f((a + b) / 2) < 0) {
      // eslint-disable-next-line no-param-reassign
      b = (a + b) / 2
    } else {
      // eslint-disable-next-line no-param-reassign
      a = (a + b) / 2
    }
  }
  return (a + b) / 2
}

/**
 * Root finding using the secant method.
 * @param f - The function whose root is sought.
 * @param a - An initial approximation to the root.
 * @param b - Another initial approximation to the root.
 * @param eps - The tolerance/accuracy desired.
 * @returns An approximation to a root of the function f.
 */
export function secant(
  f: (x: number) => number,
  a: number,
  b: number,
  eps: number = 1e-9,
): number {
  let q0 = a
  let q1 = b
  let q2: number
  // Iterate until the desired tolerance is achieved.
  while (Math.abs(q1 - q0) > eps) {
    q2 = q1 - (f(q1) * (q1 - q0)) / (f(q1) - f(q0))
    q0 = q1
    q1 = q2
  }
  // Return the approximation to the root.
  return q1
}
