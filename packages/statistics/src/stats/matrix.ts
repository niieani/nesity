export class Matrix {
  elements: number[][]

  constructor(elements: number[][]) {
    this.elements = elements
  }

  rows(): number {
    return this.elements.length
  }

  cols(): number {
    return this.elements[0]!.length
  }

  dot(m: Matrix): Matrix {
    const result: number[][] = []
    for (let i = 0; i < this.rows(); i++) {
      result[i] = []
      for (let j = 0; j < m.cols(); j++) {
        let sum = 0
        for (let k = 0; k < this.cols(); k++) {
          sum += this.elements[i]![k]! * m.elements[k]![j]!
        }
        result[i]![j] = sum
      }
    }
    return new Matrix(result)
  }
}
