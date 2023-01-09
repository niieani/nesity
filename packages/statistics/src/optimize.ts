const INVALID = Symbol('INVALID')
export const INVALID_LEFT = Symbol('INVALID_LEFT')
export const INVALID_RIGHT = Symbol('INVALID_RIGHT')

type OptimizationResult<ArgT, T, CompareT> = [
  iterationArg: ArgT,
  iterationResult: T,
  comparisonMeta: CompareT,
  rank: number,
  done: boolean,
]

export function optimize<T, ArgT, CompareT, RefT>({
  iterate,
  iterations,
  getComparisonCache,
  compare,
  getNextIterationArgument,
  reverseCompareMeta,
}: {
  iterate: (iterationArg: ArgT) => T
  iterations: number
  getComparisonCache?: (
    allResults: readonly (readonly [iterationArg: ArgT, iterationResult: T])[],
  ) => RefT
  compare: (
    a: T,
    b: T,
    indexA: number,
    indexB: number,
    comparisonReference?: RefT,
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
    return [arg, iterate(arg), undefined, 0, false]
  })
  const allResults = results.map(([arg, result]) => [arg, result] as const)
  const comparisonReference = getComparisonCache?.(allResults)

  for (let indexA = 0; indexA < results.length; indexA++) {
    for (let indexB = 0; indexB < results.length; indexB++) {
      const resultsI = results[indexA]!
      const resultsJ = results[indexB]!
      if (resultsI[4] && resultsJ[4]) {
        // eslint-disable-next-line no-continue
        continue
      }

      const compareResult =
        compareResults[indexA]?.[indexB] ??
        compare(resultsI[1], resultsJ[1], indexA, indexB, comparisonReference)
      if (compareResult === INVALID_LEFT) {
        resultsI[2] = INVALID
        resultsI[3] = Number.NEGATIVE_INFINITY
        resultsI[4] = true
        // eslint-disable-next-line no-continue
        continue
      }
      if (compareResult === INVALID_RIGHT) {
        resultsJ[2] = INVALID
        resultsJ[3] = Number.NEGATIVE_INFINITY
        resultsJ[4] = true
        // eslint-disable-next-line no-continue
        continue
      }
      const [compareValue, compareMeta] = compareResult
      resultsI[2] = compareMeta
      resultsI[3] += compareValue
      resultsI[4] = true
      compareResults[indexA]![indexB] = compareResult

      const reversedCompareMeta =
        compareMeta !== INVALID
          ? reverseCompareMeta?.(compareMeta) ?? compareMeta
          : compareMeta
      resultsJ[2] = reversedCompareMeta
      resultsJ[3] -= compareValue
      resultsJ[4] = true
      compareResults[indexB]![indexA] = [-compareValue, reversedCompareMeta]
    }
  }

  const sortedResults: OptimizationResult<ArgT, T, CompareT>[] = results
    .filter(
      (result): result is OptimizationResult<ArgT, T, CompareT> =>
        typeof result[1] !== 'undefined' && result[2] !== INVALID,
    )
    .sort(([_iArgA, _iResA, , a], [_iArgB, _iResB, , b]) => a - b)
  return sortedResults
}
