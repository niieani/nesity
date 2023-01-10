import { INVALID_LEFT, INVALID_RIGHT, optimize } from './optimize'

describe('optimize', () => {
  it('should return an array of tuples sorted by the return value of the comparison function', () => {
    const results = optimize({
      iterate: (iteration: string) =>
        // eslint-disable-next-line jest/no-conditional-in-test
        Number(Number(iteration) % 2 > 0 ? iteration : -iteration),
      compare: (a, b): [number, readonly [number, number, string]] => [
        a - b,
        // eslint-disable-next-line jest/no-conditional-in-test
        a < b ? ([a, b, 'regular'] as const) : ([b, a, 'regular'] as const),
      ],
      reverseCompareMeta: ([a, b]) => [b, a, 'reversed'] as const,
      getNextIterationArgument: String,
      iterations: 4,
    })
    expect(results).toMatchInlineSnapshot(`
      Array [
        Array [
          "0",
          -0,
          Array [
            3,
            -0,
            "reversed",
          ],
          -2,
          true,
        ],
        Array [
          "2",
          -2,
          Array [
            -2,
            -0,
            "regular",
          ],
          -2,
          true,
        ],
        Array [
          "1",
          1,
          Array [
            1,
            -0,
            "reversed",
          ],
          1,
          true,
        ],
        Array [
          "3",
          3,
          Array [
            -0,
            3,
            "regular",
          ],
          3,
          true,
        ],
      ]
    `)
  })

  it('should returns an array with the correct length', () => {
    const results = optimize({
      iterate: (iteration: number) => iteration,
      iterations: 5,
      compare: (a, b): [number, readonly any[]] => [a - b, []],
      getNextIterationArgument: (iteration: number) => iteration,
    })
    expect(results).toHaveLength(5)
  })

  it('correctly sorts the array by the return value of the comparison function', () => {
    const results = optimize({
      iterate: (iteration: number) => iteration,
      iterations: 5,
      compare: (a, b): [number, readonly any[]] => [b - a, []],
      getNextIterationArgument: (iteration: number) => iteration,
    })
    expect(results.map(([_1, _2, _3, rank]) => rank)).toMatchInlineSnapshot(`
      Array [
        -4,
        -3,
        -2,
        -1,
        10,
      ]
    `)
  })

  it('correctly handles the INVALID_LEFT and INVALID_RIGHT symbols', () => {
    const results = optimize({
      iterate: (iteration: number) => iteration,
      iterations: 5,
      compare: (a, b) =>
        // eslint-disable-next-line jest/no-conditional-in-test
        a <= 2 ? INVALID_LEFT : b <= 2 ? INVALID_RIGHT : [a - b, 'hello'],
      getNextIterationArgument: (iteration: number) => iteration + 1,
    })
    expect(
      results.map(([i, iterationResult, meta]) => iterationResult),
    ).toEqual([3, 4, 5])
  })

  it('correctly handles the reverseCompareMeta function', () => {
    const results = optimize({
      iterate: (iteration: number) => iteration,
      iterations: 5,
      compare: (a, b): [number, readonly string[]] => [a - b, []],
      getNextIterationArgument: (iteration: number) => iteration,
      reverseCompareMeta: (meta: readonly string[]) => [...meta, 'reversed'],
    })
    expect(results.map(([_, , comparisonMeta]) => comparisonMeta)).toEqual([
      ['reversed'],
      ['reversed'],
      [],
      [],
      [],
    ])
  })
})
