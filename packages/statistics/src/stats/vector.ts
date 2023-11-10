/* eslint-disable no-magic-numbers */
/* eslint-disable max-classes-per-file */

export class Vector {
  elements!: number[]

  constructor(elements: number[] | Vector = []) {
    if (elements instanceof Vector) {
      // eslint-disable-next-line no-constructor-return
      return elements
    }
    this.elements = elements
  }

  push(...value: number[]): void {
    this.elements.push(...value)
  }

  map(fun: (value: number) => number): Vector {
    return new Vector(this.elements.map(fun))
  }

  length(): number {
    return this.elements.length
  }

  concat(other: Vector): Vector {
    return new Vector([...this.elements, ...other.elements])
  }

  abs(): Vector {
    return new Vector(this.elements.map((v) => Math.abs(v)))
  }

  dot(other: Vector): number {
    return this.elements.reduce(
      (sum, item, index) => sum + item * other.elements[index]!,
      0,
    )
  }

  sum(): number {
    return this.elements.reduce((acc, val) => acc + val, 0)
  }

  log(): Vector {
    return new Vector(this.elements.map((v) => Math.log(v)))
  }

  add(term: number | Vector): Vector {
    if (term instanceof Vector) {
      return new Vector(this.elements.map((v, i) => v + term.elements[i]!))
    }
    return new Vector(this.elements.map((v) => v + term))
  }

  subtract(term: number | Vector): Vector {
    if (term instanceof Vector) {
      return new Vector(this.elements.map((v, i) => v - term.elements[i]!))
    }
    return new Vector(this.elements.map((v) => v - term))
  }

  multiply(factor: number | Vector): Vector {
    if (factor instanceof Vector) {
      return new Vector(this.elements.map((v, i) => v * factor.elements[i]!))
    }
    return new Vector(this.elements.map((v) => v * factor))
  }

  // Computes each element to the power of p
  pow(p: number): Vector {
    return new Vector(this.elements.map((v) => v ** p))
  }

  mean(): number {
    return this.sum() / this.length()
  }

  median(): number {
    const sorted = this.sortElements()
    const middle = Math.floor(sorted.length / 2)

    if (sorted.length % 2) {
      return sorted[middle]!
    }
    return (sorted[middle - 1]! + sorted[middle]!) / 2
  }

  q1(): number {
    const sorted = this.sortElements()
    const middle = Math.floor(sorted.length / 2)
    const lowerHalf = sorted.slice(0, middle)
    return new Vector(lowerHalf).median()
  }

  q3(): number {
    const sorted = this.sortElements()
    const middle = Math.ceil(sorted.length / 2)
    const upperHalf = sorted.slice(middle)
    return new Vector(upperHalf).median()
  }

  slice(start: number, end: number): Vector {
    return new Vector(this.elements.slice(start, end))
  }

  geomean(): number {
    return Math.exp(this.log().mean())
  }

  sortElements(): number[] {
    return [...this.elements].sort((a, b) => a - b)
  }

  ecdf(arg: number): number
  ecdf(arg: Vector): Vector
  ecdf(arg: number | Vector): number | Vector {
    if (arg instanceof Vector) {
      const result = new Vector([])
      for (let i = 0; i < arg.length(); i++) {
        result.push(this.#ecdf(arg.elements[i]!))
      }
      return result
    }
    return this.#ecdf(arg)
  }

  sort(): Vector {
    return new Vector(this.sortElements())
  }

  min(): number {
    return Math.min(...this.elements)
  }

  max(): number {
    return Math.max(...this.elements)
  }

  toString(): string {
    return `[${this.elements.join(', ')}]`
  }

  /*
   * unbiased sample variance
   */
  variance(): number {
    return this.ss() / (this.length() - 1)
  }

  /*
   * biased sample variance
   */
  biasedVariance(): number {
    return this.ss() / this.length()
  }

  /*
   * corrected sample standard deviation
   */
  sd(): number {
    return Math.sqrt(this.variance())
  }

  /*
   * uncorrected sample standard deviation
   */
  uncorrectedSd(): number {
    return Math.sqrt(this.biasedVariance())
  }

  /**
   * Calculates the standard error of the mean (SEM) of the vector's elements.
   * @returns The standard error of the mean.
   */
  sem(): number {
    return this.sd() / Math.sqrt(this.length())
  }

  /*
   * total sum of squares
   */
  ss(): number {
    const meanValue = this.mean()
    return this.elements.reduce(
      (sum, value) => sum + (value - meanValue) ** 2,
      0,
    )
  }

  /*
   * residuals
   */
  res(): Vector {
    const meanValue = this.mean()
    return new Vector(this.elements.map((v) => v - meanValue))
  }

  // Computes the kurtosis
  kurtosis(): number {
    return this.res().pow(4).mean() / this.res().pow(2).mean() ** 2
  }

  // Computes the skewness
  skewness(): number {
    return this.res().pow(3).mean() / this.res().pow(2).mean() ** (3 / 2)
  }

  // not in the original implementation
  divide(divisor: number | Vector): Vector {
    if (divisor instanceof Vector) {
      return new Vector(this.elements.map((v, i) => v / divisor.elements[i]!))
    }
    return new Vector(this.elements.map((v) => v / divisor))
  }

  // Computes the empirical cumulative distribution function (ECDF)
  #ecdf(value: number): number {
    const sorted = this.sortElements()
    let count = 0
    for (let i = 0; i < sorted.length && sorted[i]! <= value; i++) {
      count++
    }
    return count / sorted.length
  }
}

export class Sequence extends Vector {
  constructor(min: number, max: number, step: number = 1) {
    super()
    for (let i = min; i <= max; i += step) {
      this.elements.push(i)
    }
  }
}
