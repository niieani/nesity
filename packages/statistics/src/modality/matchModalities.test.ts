import { matchModalities } from './matchModalities.js'

describe('matchModalities', () => {
  it('should return an array of matched split pairs', () => {
    const rawSplits1 = [
      [1, 2, 3],
      [4, 5, 6],
    ]
    const rawSplits2 = [
      [2, 3, 4],
      [5, 6, 7],
      [8, 9, 10],
    ]
    const expectedResult = [
      [
        [1, 2, 3],
        [2, 3, 4],
      ],
      [
        [4, 5, 6],
        [5, 6, 7],
      ],
      [undefined, [8, 9, 10]],
    ]
    expect(
      matchModalities({ rawSplits1, rawSplits2 }).map((result) =>
        result.map((d) => d?.data),
      ),
    ).toEqual(expectedResult)
  })

  it('should return an array of matched split pairs when not in order', () => {
    const rawSplits1 = [
      [1, 2, 3],
      [4, 5, 6],
    ]
    const rawSplits2 = [
      [5, 6, 7],
      [8, 9, 10],
      [2, 3, 4],
    ]
    const expectedResult = [
      [
        [1, 2, 3],
        [2, 3, 4],
      ],
      [
        [4, 5, 6],
        [5, 6, 7],
      ],
      [undefined, [8, 9, 10]],
    ]

    expect(
      matchModalities({ rawSplits1, rawSplits2 }).map((result) =>
        result.map((d) => d?.data),
      ),
    ).toEqual(expectedResult)
  })

  it('should return an array of closest split pairs matches even when there are no good matches', () => {
    const rawSplits1 = [
      [1, 2, 3],
      [4, 5, 6],
    ]
    const rawSplits2 = [
      [7, 8, 9],
      [12, 13, 14],
    ]
    const expectedResult = [
      [
        [1, 2, 3],
        [7, 8, 9],
      ],
      [
        [4, 5, 6],
        [12, 13, 14],
      ],
    ]

    expect(
      matchModalities({ rawSplits1, rawSplits2 }).map((result) =>
        result.map((d) => d?.data),
      ),
    ).toEqual(expectedResult)
  })

  it('should return an array of closest split pairs matches with noisy data', () => {
    const rawSplits1 = [[1, 2, 2, 2, 2, 3], [40, 50, 50, 60], [120]]
    const rawSplits2 = [
      [1, 2],
      [3, 4, 4, 4, 4, 4],
      [40, 50, 50],
      [100, 110],
    ]
    const expectedResult = [
      [undefined, [1, 2]],
      [
        [1, 2, 2, 2, 2, 3],
        [3, 4, 4, 4, 4, 4],
      ],
      [
        [40, 50, 50, 60],
        [40, 50, 50],
      ],
      [[120], [100, 110]],
    ]

    expect(
      matchModalities({
        rawSplits1,
        rawSplits2,
      }).map((result) => result.map((d) => d?.data)),
    ).toEqual(expectedResult)
  })

  it('should return an array of closest split pairs matches with real world data', () => {
    const rawSplits1 = [
      [24.992, 28.01, 29.373, 32.647],
      [93.469, 95.761, 98.026, 99.019, 102.28],
      [566.367, 607.782, 609.666, 610.453, 612.29, 621.299, 625.553],
    ]
    const rawSplits2 = [
      [10.239, 10.293, 10.4, 10.856, 11.11, 11.706, 11.935, 13.279],
      [66.587, 68.986],
      [127.194],
      [578.245, 586.523, 593.91, 608.943, 706.821],
    ]
    expect(
      matchModalities({ rawSplits1, rawSplits2 }).map((result) =>
        result.map((d) => d?.data),
      ),
    ).toMatchInlineSnapshot(`
      [
        [
          [
            24.992,
            28.01,
            29.373,
            32.647,
          ],
          [
            10.239,
            10.293,
            10.4,
            10.856,
            11.11,
            11.706,
            11.935,
            13.279,
          ],
        ],
        [
          [
            93.469,
            95.761,
            98.026,
            99.019,
            102.28,
          ],
          [
            66.587,
            68.986,
          ],
        ],
        [
          undefined,
          [
            127.194,
          ],
        ],
        [
          [
            566.367,
            607.782,
            609.666,
            610.453,
            612.29,
            621.299,
            625.553,
          ],
          [
            578.245,
            586.523,
            593.91,
            608.943,
            706.821,
          ],
        ],
      ]
    `)
  })

  it('should return an array of closest split pairs matches with real world data (2)', () => {
    const rawSplits1 = [
      [
        10.239, 10.293, 10.4, 10.856, 11.11, 11.706, 11.935, 13.279, 66.587,
        68.986,
      ],
      [127.194],
      [578.245, 586.523, 593.91, 608.943],
      [706.821],
    ]
    const rawSplits2 = [
      [24.992, 28.01, 29.373, 32.647],
      [93.469, 95.761, 98.026, 99.019, 102.28],
      [566.367, 607.782, 609.666, 610.453, 612.29, 621.299, 625.553],
    ]
    const matched = matchModalities({ rawSplits1, rawSplits2 }).map((result) =>
      result.map((d) => d?.data),
    )
    expect(matched).toMatchInlineSnapshot(`
      [
        [
          [
            10.239,
            10.293,
            10.4,
            10.856,
            11.11,
            11.706,
            11.935,
            13.279,
            66.587,
            68.986,
          ],
          [
            24.992,
            28.01,
            29.373,
            32.647,
          ],
        ],
        [
          [
            127.194,
          ],
          [
            93.469,
            95.761,
            98.026,
            99.019,
            102.28,
          ],
        ],
        [
          [
            578.245,
            586.523,
            593.91,
            608.943,
          ],
          [
            566.367,
            607.782,
            609.666,
            610.453,
            612.29,
            621.299,
            625.553,
          ],
        ],
        [
          [
            706.821,
          ],
          undefined,
        ],
      ]
    `)
  })

  it('should return a pair for two unimodal inputs', () => {
    const rawSplits1 = [[500]]
    const rawSplits2 = [[800]]
    expect(
      matchModalities({ rawSplits1, rawSplits2 }).map((result) =>
        result.map((d) => d?.data),
      ),
    ).toEqual([[[500], [800]]])
  })

  it('should return the correct pair for one unimodal and one bimodal input', () => {
    const rawSplits1 = [[500]]
    const rawSplits2 = [[550], [800, 900]]
    expect(
      matchModalities({ rawSplits1, rawSplits2 }).map((result) =>
        result.map((d) => d?.data),
      ),
    ).toEqual([
      [[500], [550]],
      [undefined, [800, 900]],
    ])
  })

  it('should match the two largest splits, even if they are not the closest by mean', () => {
    const rawSplits1 = [[500, 550, 550, 560, 560, 560, 560, 560, 560, 560, 560]]
    const rawSplits2 = [
      [550, 560],
      [700, 730, 740, 740, 740, 740, 750, 750, 750],
    ]
    expect(
      matchModalities({
        rawSplits1,
        rawSplits2,
      }).map((result) => result.map((d) => d?.data)),
    ).toEqual([
      [undefined, [550, 560]],
      [rawSplits1[0], rawSplits2[1]],
    ])
  })
})
