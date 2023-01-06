const INVALID = Symbol('INVALID')
export const INVALID_LEFT = Symbol('INVALID_LEFT')
export const INVALID_RIGHT = Symbol('INVALID_RIGHT')

type OptimizationResult<ArgT, T, CompareT> = [
  iterationArg: ArgT,
  iterationResult: T,
  comparisonMeta: CompareT,
  rank: number,
]

export function optimize<T, ArgT, CompareT>({
  iterate,
  iterations,
  compare,
  getNextIterationArgument,
  reverseCompareMeta,
}: {
  iterate: (iterationArg: ArgT) => T
  iterations: number
  compare: (
    a: T,
    b: T,
  ) =>
    | [compareRank: number, compareMeta: CompareT]
    | typeof INVALID_LEFT
    | typeof INVALID_RIGHT
  getNextIterationArgument: (iteration: number) => ArgT
  reverseCompareMeta?: (meta: CompareT) => CompareT
}): OptimizationResult<ArgT, T, CompareT>[] {
  const compareResults: [number, CompareT | typeof INVALID][][] = Array.from(
    { length: iterations },
    (_) => Array.from({ length: iterations }),
  )
  const results = Array.from<
    never,
    OptimizationResult<ArgT, T, CompareT | typeof INVALID | undefined>
  >({ length: iterations }, (_, i) => {
    const arg = getNextIterationArgument(i)
    return [arg, iterate(arg), undefined, 0]
  })

  for (let i = 0; i < results.length; i++) {
    for (let j = i + 1; j < results.length; j++) {
      const resultsI = results[i]!
      const resultsJ = results[j]!
      const compareResult =
        compareResults[i]?.[j] ?? compare(resultsI[1], resultsJ[1])
      if (compareResult === INVALID_LEFT) {
        resultsI[2] = INVALID
        resultsI[3] = Number.NEGATIVE_INFINITY
        // eslint-disable-next-line no-continue
        continue
      }
      if (compareResult === INVALID_RIGHT) {
        resultsJ[2] = INVALID
        resultsJ[3] = Number.NEGATIVE_INFINITY
        // eslint-disable-next-line no-continue
        continue
      }
      const [compareValue, compareMeta] = compareResult
      resultsI[2] = compareMeta
      resultsI[3] += compareValue
      const reversedCompareMeta =
        compareMeta !== INVALID
          ? reverseCompareMeta?.(compareMeta) ?? compareMeta
          : compareMeta
      resultsJ[2] = reversedCompareMeta
      resultsJ[3] -= compareValue
      compareResults[i]![j] = compareResult
      compareResults[j]![i] = [-compareValue, reversedCompareMeta]
    }
  }

  const sortedResults: OptimizationResult<ArgT, T, CompareT>[] = results
    .filter(
      (result): result is OptimizationResult<ArgT, T, CompareT> =>
        typeof result[1] !== 'undefined' && result[2] !== INVALID,
    )
    .sort(([_iArgA, _iResA, , a], [_iArgB, _iResB, , b]) => a - b) as [
    iterationArg: ArgT,
    iterationResult: T,
    comparisonMeta: CompareT,
    rank: number,
  ][]
  return sortedResults
}
