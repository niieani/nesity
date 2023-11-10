import { T } from './distributions.js'
import { Vector } from './vector.js'

export function normal(x: Vector, c: number): [number, number] {
  const alpha = 1 - c
  const t = new T(x.length() - 1)
  const lower = x.mean() - t.inverse(1 - alpha / 2) * x.sem()
  const upper = x.mean() + t.inverse(1 - alpha / 2) * x.sem()
  return [lower, upper]
}

export function normalUpper(x: Vector, c: number): number {
  const alpha = 1 - c
  const t = new T(x.length() - 1)
  return x.mean() + t.inverse(1 - alpha) * x.sem()
}

export function normalLower(x: Vector, c: number): number {
  const alpha = 1 - c
  const t = new T(x.length() - 1)
  return x.mean() - t.inverse(1 - alpha) * x.sem()
}
