import { optimize } from './optimize'

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
    expect(results).toEqual([
      ['2', -2, [-2, 3, 'regular'], -10],
      ['0', -0, [-0, 3, 'regular'], -2],
      ['1', 1, [1, 3, 'regular'], 2],
      ['3', 3, [3, -2, 'reversed'], 10],
    ])
  })
})
