/* eslint-disable no-magic-numbers */
/**
 * Brent's root finding and minimization algorithm.
 *
 * In numerical analysis, Brent's method is a complicated but popular root-finding
 * algorithm combining the bisection method, the secant method and inverse quadratic
 * interpolation. It has the reliability of bisection but it can be as quick as some
 * of the less reliable methods. The idea is to use the secant method or inverse quadratic
 * interpolation if possible, because they converge faster, but to fall back to the more
 * robust bisection method if necessary. Brent's method is due to Richard Brent (1973)
 * and builds on an earlier algorithm of Theodorus Dekker (1969).
 *
 * The algorithms implemented in this class are based on the original C source code
 * available in Netlib (http://www.netlib.org/c/brent.shar) by Oleg Keselyov, 1991.
 *
 * References:
 *     R.P. Brent (1973). Algorithms for Minimization without Derivatives, Chapter 4.
 *     Prentice-Hall, Englewood Cliffs, NJ. ISBN 0-13-022335-2.
 *
 * Searches the interval from *lowerLimit* to *upperLimit*
 * for a root (i.e., zero) of the function *func* with respect to
 * its first argument using Brent's method root-finding algorithm.
 *
 * Translated from zeroin.c in http://www.netlib.org/c/brent.shar.
 *
 * Copyright (c) 2012 Borgar Thorsteinsson <borgar@borgar.net>
 * MIT License, http://www.opensource.org/licenses/mit-license.php
 *
 * @returns an estimate for the root within accuracy.
 */
export function uniroot(
  /** function for which the root is sought */
  func: (n: number) => number,
  /** the lower point of the interval to be searched */
  lowerLimit: number,
  /** the upper point of the interval to be searched */
  upperLimit: number,
  /** the desired accuracy (convergence tolerance) */
  errorTol: number | undefined = 0,
  /** the maximum number of iterations */
  maxIter: number | undefined = 1_000,
): number {
  if (lowerLimit === 0 && upperLimit === 0) {
    throw new Error('Both lower and upper limits are zero')
  }

  let a = lowerLimit
  let b = upperLimit
  let c = a
  let fa = func(a)
  let fb = func(b)
  let fc = fa
  let actualTolerance // Actual tolerance
  let newStep // Step at this iteration
  let prevStep // Distance from the last but one to the last approximation
  let p // Interpolation step is calculated in the form p/q; division is delayed until the last moment
  let q

  let iteration = maxIter

  while (iteration-- > 0) {
    prevStep = b - a

    if (Math.abs(fc) < Math.abs(fb)) {
      // Swap data for b to be the best approximation
      ;[a, b, c] = [b, c, b]
      ;[fa, fb, fc] = [fb, fc, fb]
    }

    actualTolerance = 1e-15 * Math.abs(b) + errorTol / 2
    newStep = (c - b) / 2

    if (Math.abs(newStep) <= actualTolerance || fb === 0) {
      return b // Acceptable approx. is found
    }

    // Decide if the interpolation can be tried
    if (Math.abs(prevStep) >= actualTolerance && Math.abs(fa) > Math.abs(fb)) {
      // If prev_step was large enough and was in true direction, Interpolatiom may be tried
      let t1
      let t2
      const cb = c - b
      if (a === c) {
        // If we have only two distinct points linear interpolation can only be applied
        t1 = fb / fa
        p = cb * t1
        q = 1 - t1
      } else {
        // Quadric inverse interpolation
        ;[q, t1, t2] = [fa / fc, fb / fc, fb / fa]
        p = t2 * (cb * q * (q - t1) - (b - a) * (t1 - 1))
        q = (q - 1) * (t1 - 1) * (t2 - 1)
      }

      if (p > 0) {
        q = -q // p was calculated with the opposite sign; make p positive
      } else {
        p = -p // and assign possible minus to q
      }

      if (
        p < 0.75 * cb * q - Math.abs(actualTolerance * q) / 2 &&
        p < Math.abs((prevStep * q) / 2)
      ) {
        // If (b + p / q) falls in [b,c] and isn't too large it is accepted
        newStep = p / q
      }

      // If p/q is too large then the bissection procedure can reduce [b,c] range to more extent
    }

    if (Math.abs(newStep) < actualTolerance) {
      // Adjust the step to be not less than tolerance
      newStep = newStep > 0 ? actualTolerance : -actualTolerance
    }

    // Save the previous approx.
    ;[a, fa] = [b, fb]
    b += newStep
    fb = func(b) // Do step to a new approxim.

    if ((fb > 0 && fc > 0) || (fb < 0 && fc < 0)) {
      // Adjust c for it to have a sign opposite to that of b
      ;[c, fc] = [a, fa]
    }
  }

  throw new Error('Maximum number of iterations exceeded')
}
