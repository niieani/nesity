import jerzy from 'jerzy'

export const calcShapiroWilk = (data: number[]) => {
  const result = jerzy.Normality.shapiroWilk(new jerzy.Vector(data))
  return {
    pValue: result.p,
    statistic: result.w,
  }
}
