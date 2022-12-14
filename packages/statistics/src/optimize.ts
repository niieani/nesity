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
      // eslint-disable-next-line no-continue
      if (indexA === indexB) continue

      const resultA = results[indexA]!
      const resultB = results[indexB]!
      if (resultA[4] && resultA[4]) {
        // eslint-disable-next-line no-continue
        continue
      }

      const compareResult =
        // compareResults[indexA]?.[indexB] ??
        compare(resultA[1], resultB[1], indexA, indexB, comparisonReference)

      if (compareResult === INVALID_LEFT) {
        resultA[2] = INVALID
        resultA[3] = Number.NEGATIVE_INFINITY
        resultA[4] = true
        // eslint-disable-next-line no-continue
        continue
      }
      if (compareResult === INVALID_RIGHT) {
        resultB[2] = INVALID
        resultB[3] = Number.NEGATIVE_INFINITY
        resultB[4] = true
        // eslint-disable-next-line no-continue
        continue
      }
      const [compareValue, compareMeta] = compareResult
      resultA[2] = compareMeta
      resultA[3] += compareValue
      resultA[4] = true
      compareResults[indexA]![indexB] = compareResult

      const reversedCompareMeta =
        compareMeta !== INVALID
          ? reverseCompareMeta?.(compareMeta) ?? compareMeta
          : compareMeta
      resultB[2] = reversedCompareMeta
      resultB[3] -= compareValue
      resultB[4] = true
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
