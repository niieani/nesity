export function optimize<T, ArgT, CompareT>({
  iterate,
  iterations,
  compare,
  getNextIterationArgument,
  reverseCompareMeta,
}: {
  iterate: (iterationArg: ArgT) => T
  iterations: number
  compare: (a: T, b: T) => [compareRank: number, compareMeta: CompareT]
  getNextIterationArgument: (iteration: number) => ArgT
  reverseCompareMeta?: (meta: CompareT) => CompareT
}) {
  const compareResults: [number, CompareT][][] = Array.from(
    { length: iterations },
    (_) => Array.from({ length: iterations }),
  )
  const results = Array.from<
    never,
    [
      iterationArg: ArgT,
      iterationResult: T,
      comparisonMeta: CompareT | undefined,
      rank: number,
    ]
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
      const [compareValue, compareMeta] = compareResult
      resultsI[2] = compareMeta
      resultsI[3] += compareValue
      const reversedCompareMeta =
        reverseCompareMeta?.(compareMeta) ?? compareMeta
      resultsJ[2] = reversedCompareMeta
      resultsJ[3] -= compareValue
      compareResults[i]![j] = compareResult
      compareResults[j]![i] = [-compareValue, reversedCompareMeta]
    }
  }
  return results.sort(
    ([_iArgA, _iResA, , a], [_iArgB, _iResB, , b]) => a - b,
  ) as (readonly [
    iterationArg: ArgT,
    iterationResult: T,
    comparisonMeta: CompareT,
    rank: number,
  ])[]
}
