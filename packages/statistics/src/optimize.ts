const INVALID = Symbol('INVALID')
export const INVALID_LEFT = Symbol('INVALID_LEFT')
export const INVALID_RIGHT = Symbol('INVALID_RIGHT')

export type OptimizationResult<ArgT, T, CompareT> = [
  iterationArg: ArgT,
  iterationResult: T,
  comparisonMeta: CompareT,
  rank: number,
  done: boolean,
]

/**
 * The optimize function is a generic utility function to find the "best" input parameter/output result combination.
 * It works by computing results, and then comparing them with each other result.
 * It can be used to optimize an objective function by repeatedly evaluating it with different input parameters,
 * and comparing the results of these evaluations to determine the best result and input parameter combination.
 * The optimization is performed in a series of iterations, with each iteration producing a set of results.
 * Each iteration result is compared with each other iteration result, and the results are sorted by their comparison rank.
 *
 * @returns An array of optimization results sorted by their comparison rank.
 * Each result is an array with the iteration argument, the iteration result, the comparison metadata, the comparison rank and a done flag.
 */
export function optimize<T, ArgT, CompareT, RefT>({
  iterate,
  iterations,
  getComparisonCache,
  compare,
  getNextIterationArgument,
  reverseCompareMeta,
}: {
  /** A function that returns the argument passed to the `iteration` function, based on the current iteration number. */
  getNextIterationArgument: (iteration: number) => ArgT
  /** The function that performs the calculation, for which optimization is sought. */
  iterate: (iterationArg: ArgT) => T
  /** The number of iterations to perform. */
  iterations: number
  /** An optional function to summarize or pre-compute data from all comparisons, passed to the `compare` function. */
  getComparisonCache?: (
    allResults: readonly (readonly [iterationArg: ArgT, iterationResult: T])[],
  ) => RefT
  /** A function that compares two iteration results and returns an objective comparison rank and metadata, or an INVALID_LEFT, INVALID_RIGHT symbol either of the results should be rejected. */
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
