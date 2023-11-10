/* eslint-disable no-magic-numbers */
/* eslint-disable @typescript-eslint/no-parameter-properties */
/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/member-ordering */
/* eslint-disable max-classes-per-file */
import { erf, gamma, rbeta } from './misc.js'
import { bisection } from './numeric.js'
import { Vector } from './vector.js'

// Inverse: Coefficients in rational approximations
const a = [
  -3.969_683_028_665_376e+1, 2.209_460_984_245_205e+2,
  -2.759_285_104_469_687e+2, 1.383_577_518_672_69e+2, -3.066_479_806_614_716e+1,
  2.506_628_277_459_239e+0,
] as const

const b = [
  -5.447_609_879_822_406e+1, 1.615_858_368_580_409e+2,
  -1.556_989_798_598_866e+2, 6.680_131_188_771_972e+1,
  -1.328_068_155_288_572e+1,
] as const

const c = [
  -7.784_894_002_430_293e-3, -3.223_964_580_411_365e-1,
  -2.400_758_277_161_838e+0, -2.549_732_539_343_734e+0,
  4.374_664_141_464_968e+0, 2.938_163_982_698_783e+0,
] as const

const d = [
  7.784_695_709_041_462e-3, 3.224_671_290_700_398e-1, 2.445_134_137_142_996e+0,
  3.754_408_661_907_416e+0,
] as const

// Define break-points
const plow = 0.024_25
const phigh = 1 - plow

export class Normal {
  constructor(public mean: number, public variance: number) {}

  #de(x: number): number {
    return (
      (1 / (Math.sqrt(this.variance) * Math.sqrt(2 * Math.PI))) *
      Math.exp(-((x - this.mean) ** 2) / (2 * this.variance))
    )
  }

  #di(x: number, precision?: number): number {
    return (
      0.5 *
      (1 +
        erf(
          (x - this.mean) / (Math.sqrt(this.variance) * Math.sqrt(2)),
          precision,
        ))
    )
  }

  dens(arg: number): number
  dens(arg: Vector): Vector
  dens(arg: number | Vector): Vector | number {
    if (arg instanceof Vector) {
      const result = new Vector([])
      for (let i = 0; i < arg.length(); i++) {
        result.push(this.#de(arg.elements[i]!))
      }
      return result
    }
    return this.#de(arg)
  }

  /**
   * cumulative distribution function (CDF) for a normal distribution
   */
  distr(arg: number, precision?: number): number
  distr(arg: Vector, precision?: number): Vector
  distr(arg: number | Vector, precision?: number): Vector | number {
    if (arg instanceof Vector) {
      const result = new Vector([])
      for (let i = 0; i < arg.length(); i++) {
        result.push(this.#di(arg.elements[i]!, precision))
      }
      return result
    }
    return this.#di(arg, precision)
  }

  inverse(p: number): number {
    // Rational approximation for lower region
    if (p < plow) {
      const q = Math.sqrt(-2 * Math.log(p))
      return (
        ((((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
          ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1)) *
          this.variance +
        this.mean
      )
    }

    if (p < phigh) {
      // Rational approximation for central region
      const q = p - 0.5
      const r = q * q
      return (
        (((((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r +
          a[5]) *
          q) /
          (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1)) *
          this.variance +
        this.mean
      )
    }

    // Rational approximation for upper region
    const q = Math.sqrt(-2 * Math.log(1 - p))
    return (
      (-(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
        ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1)) *
        this.variance +
      this.mean
    )
  }
}

export class StandardNormal extends Normal {
  constructor() {
    super(0, 1)
  }
}

export class T {
  constructor(public df: number) {}

  private _de(x: number): number {
    return (
      (gamma((this.df + 1) / 2) /
        (Math.sqrt(this.df * Math.PI) * gamma(this.df / 2))) *
      (1 + x ** 2 / this.df) ** (-(this.df + 1) / 2)
    )
  }

  private _di(x: number): number {
    if (x < 0) {
      return 0.5 * rbeta(this.df / (x ** 2 + this.df), this.df / 2, 0.5)
    }
    return 1 - 0.5 * rbeta(this.df / (x ** 2 + this.df), this.df / 2, 0.5)
  }

  dens(arg: number): number
  dens(arg: Vector): Vector
  dens(arg: number | Vector): Vector | number {
    if (arg instanceof Vector) {
      const result = new Vector([])
      for (let i = 0; i < arg.length(); i++) {
        result.push(this._de(arg.elements[i]!))
      }
      return result
    }
    return this._de(arg)
  }

  distr(arg: number): number
  distr(arg: Vector): Vector
  distr(arg: number | Vector): Vector | number {
    if (arg instanceof Vector) {
      const result = new Vector([])
      for (let i = 0; i < arg.length(); i++) {
        result.push(this._di(arg.elements[i]!))
      }
      return result
    }
    return this._di(arg)
  }

  inverse(x: number): number {
    return bisection((y) => this._di(y) - x, -10.1, 10)
  }
}

export class F {
  constructor(public df1: number, public df2: number) {}

  private _di(x: number): number {
    return rbeta(
      (this.df1 * x) / (this.df1 * x + this.df2),
      this.df1 / 2,
      this.df2 / 2,
    )
  }

  distr(arg: number): number
  distr(arg: Vector): Vector
  distr(arg: number | Vector): Vector | number {
    if (arg instanceof Vector) {
      const result = new Vector([])
      for (let i = 0; i < arg.length(); i++) {
        result.push(this._di(arg.elements[i]!))
      }
      return result
    }
    return this._di(arg)
  }
}

export class Kolmogorov {
  private _di(x: number): number {
    let term
    let sum = 0
    let k = 1
    do {
      term = Math.exp((-((2 * k - 1) ** 2) * Math.PI ** 2) / (8 * x ** 2))
      sum += term
      k++
    } while (Math.abs(term) > 1e-11)
    return (Math.sqrt(2 * Math.PI) * sum) / x
  }

  distr(arg: number): number
  distr(arg: Vector): Vector
  distr(arg: number | Vector): Vector | number {
    if (arg instanceof Vector) {
      const result = new Vector([])
      for (let i = 0; i < arg.length(); i++) {
        result.push(this._di(arg.elements[i]!))
      }
      return result
    }
    return this._di(arg)
  }

  inverse(x: number): number {
    return bisection((y) => this._di(y) - x, 0, 1)
  }
}
