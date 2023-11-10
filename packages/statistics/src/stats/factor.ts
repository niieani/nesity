export class Factor {
  levels: string[]
  factors: number[]

  constructor(elements: string[]) {
    this.levels = []
    this.factors = []
    for (const element of elements) {
      const index = this.levels.indexOf(element)
      if (index !== -1) {
        this.factors.push(index)
      } else {
        this.levels.push(element)
        this.factors.push(this.levels.length - 1)
      }
    }
  }

  group(g: number): number[] {
    const indices: number[] = []
    let i = this.factors.indexOf(g)
    while (i !== -1) {
      indices.push(i)
      i = this.factors.indexOf(g, i + 1)
    }
    return indices
  }

  length(): number {
    return this.factors.length
  }

  groups(): number {
    return this.levels.length
  }
}
