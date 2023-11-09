import {
  calcChangeProbability,
  calcCL,
  calcCohensD,
  calcGaussOverlap,
  calcU3,
} from './cohensd.js'

export interface EffectSizeStats {
  cohensD: number
  overlappingCoefficient: number
  probabilityOfSuperiority: number
  nonOverlapMeasure: number
  changeProbability: number
}

export function getEffectSizeStats({
  mean1,
  mean2,
  pooledStDev,
  data1,
  data2,
}: {
  mean1: number
  mean2: number
  pooledStDev: number
  data1: number[]
  data2: number[]
}): EffectSizeStats {
  const cohensD = calcCohensD({ mean1, mean2, pooledStDev, data1, data2 })
  const overlappingCoefficient = calcGaussOverlap(cohensD)
  const nonOverlapMeasure = calcU3(cohensD)
  const probabilityOfSuperiority = calcCL(cohensD)
  const changeProbability = calcChangeProbability(probabilityOfSuperiority)
  return {
    cohensD,
    overlappingCoefficient,
    nonOverlapMeasure,
    probabilityOfSuperiority,
    changeProbability,
  }
}
