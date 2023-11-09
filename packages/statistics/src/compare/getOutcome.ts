import type { EffectSizeStats } from '../effectSize/effectSizeStats.js'
import type {
  ComparisonOutcome,
  InternalGetOutcomeOptions,
  TTestResultBase,
} from './types.js'

export function getOutcome(
  {
    twoSided,
    greater,
    less,
  }: {
    twoSided: TTestResultBase
    greater: TTestResultBase
    less: TTestResultBase
  },
  {
    data1,
    data2,
    meanDifference,
    effectSizeStats: { changeProbability },
  }: {
    data1: number[]
    data2: number[]
    meanDifference: number
    effectSizeStats: EffectSizeStats
  },
  {
    requireTwoSidedNullHypothesisRejection,
    minimalAbsoluteChangeProbability,
  }: InternalGetOutcomeOptions,
): { outcome: ComparisonOutcome; definitive: boolean } {
  const data1IsEqual = data1.every((d) => d === data1[0])
  const data2IsEqual = data2.every((d) => d === data2[0])
  const isSimpleComparison =
    (data1.length === 1 && data2.length === 1) || (data1IsEqual && data2IsEqual)
  if (isSimpleComparison) {
    return {
      outcome:
        meanDifference === 0
          ? 'equal'
          : meanDifference > 0
          ? 'greater'
          : 'less',
      definitive: true,
    }
  }

  const isTTestInvalid =
    Number.isNaN(twoSided.pValue) ||
    Number.isNaN(greater.pValue) ||
    Number.isNaN(less.pValue)

  const bothAreExactlyEqual =
    meanDifference === 0 &&
    data1IsEqual &&
    data2IsEqual &&
    data1[0] === data2[0]

  // hypothesis: Actual difference in means is not equal to 0
  const tTestOutcome = bothAreExactlyEqual
    ? 'equal'
    : isTTestInvalid
    ? 'invalid'
    : // first is greater than second
    greater.rejected &&
      (!requireTwoSidedNullHypothesisRejection || twoSided.rejected)
    ? 'less'
    : // first is less than second
    less.rejected &&
      (!requireTwoSidedNullHypothesisRejection || twoSided.rejected)
    ? 'greater'
    : twoSided.rejected
    ? Math.min(greater.pValue, less.pValue) === greater.pValue
      ? 'less'
      : 'greater'
    : 'similar'

  const outcome =
    Math.abs(changeProbability) < minimalAbsoluteChangeProbability
      ? 'similar'
      : tTestOutcome

  return { outcome, definitive: isTTestInvalid || bothAreExactlyEqual }
}
