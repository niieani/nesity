import { shapiroWilk } from './stats/normality.js'

export const calcShapiroWilk = (data: number[]) => {
  const result = shapiroWilk(data)
  return {
    pValue: result.p,
    statistic: result.w,
  }
}
