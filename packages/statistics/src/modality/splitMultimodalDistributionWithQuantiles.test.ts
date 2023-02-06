import {
  BIMODAL_SAMPLE,
  BIMODAL_SAMPLE_1,
  BIMODAL_SAMPLE_2,
  MULTIMODAL_SAMPLE,
  MULTIMODAL_SAMPLE_1,
  MULTIMODAL_SAMPLE_2,
  MULTIMODAL_SAMPLE_3,
  MULTIMODAL_SAMPLE_BEGINNING,
  MULTIMODAL_SAMPLE_HEAVY_BEGINNING,
  REAL_WORLD_DATA_9_SIMILAR_VERY_NOISY,
  REAL_WORLD_DATA_12_SIMILAR_3_MODES,
  UNIMODAL_SAMPLE,
  UNIMODAL_SAMPLE_NORMAL_DISTRIBUTION,
  UNIMODAL_SAMPLE_REAL,
} from '../__fixtures__/testSamples'
import { splitMultimodalDistribution } from './splitMultimodalDistributionWithQuantiles'

describe('splitMultimodalDistribution', () => {
  it('keeps a unimodal dataset unchanged', () => {
    expect(
      splitMultimodalDistribution({
        data: UNIMODAL_SAMPLE,
      }),
    ).toEqual([UNIMODAL_SAMPLE])
  })

  it('keeps a unimodal normally distributed dataset unchanged', () => {
    expect(
      splitMultimodalDistribution({
        data: UNIMODAL_SAMPLE_NORMAL_DISTRIBUTION,
      }),
    ).toEqual([UNIMODAL_SAMPLE_NORMAL_DISTRIBUTION])
  })

  it('keeps another unimodal normally distributed dataset unchanged', () => {
    expect(
      splitMultimodalDistribution({
        data: UNIMODAL_SAMPLE_REAL,
      }),
    ).toEqual([UNIMODAL_SAMPLE_REAL])
  })

  it('splits a bimodal dataset into unimodal datasets', () => {
    expect(
      splitMultimodalDistribution({
        data: BIMODAL_SAMPLE,
      }),
    ).toEqual([BIMODAL_SAMPLE_1, BIMODAL_SAMPLE_2])
  })

  it('splits a multimodal dataset into unimodal datasets', () => {
    const result = splitMultimodalDistribution({
      data: MULTIMODAL_SAMPLE,
    })
    expect(result).toHaveLength(3)
    expect(result).toEqual([
      MULTIMODAL_SAMPLE_1,
      MULTIMODAL_SAMPLE_2,
      MULTIMODAL_SAMPLE_3,
    ])
  })

  it('splits a multimodal dataset with a heavy beginning into unimodal datasets', () => {
    const result = splitMultimodalDistribution({
      data: MULTIMODAL_SAMPLE_HEAVY_BEGINNING,
    })
    expect(result).toHaveLength(3)
    expect(result).toEqual([
      [...MULTIMODAL_SAMPLE_BEGINNING, ...MULTIMODAL_SAMPLE_1],
      MULTIMODAL_SAMPLE_2,
      MULTIMODAL_SAMPLE_3,
    ])
  })

  it('splits a noisy multimodal dataset', () => {
    const result = splitMultimodalDistribution({
      data: REAL_WORLD_DATA_12_SIMILAR_3_MODES.data2,
    })
    expect(result).toMatchInlineSnapshot(`
      Array [
        Array [
          1655.1870126281738,
          1697.844811050415,
          1730.084998422241,
          1799.1376126281739,
          1801.4822953338626,
          1807.4067110504152,
          1836.9775984222415,
        ],
        Array [
          2162.184772872925,
        ],
        Array [
          2417.9209626281736,
          2460.1782126281737,
          2519.0311542205814,
          2553.4256126281734,
          2558.0895075439453,
          2561.3133126281737,
          2608.71175,
          2612.041836044312,
          2656.1090999999997,
          2662.936,
          2665.081912628174,
          2676.8762500000003,
          2687.371720092774,
          2692.2305658721925,
          2714.598765426636,
          2731.2187999999996,
          2742.831912628174,
          2788.5668785003663,
          2849.2273999999998,
          2894.4015158721922,
        ],
        Array [
          3228.7299678039553,
          3293.002262628174,
          3299.105721432495,
          3309.3434214324952,
          3353.7534019317627,
          3431.573551931763,
          3444.1660000000006,
          3453.794862628174,
          3459.372478500366,
          3468.038207962036,
          3513.2638500000003,
          3647.251095333862,
        ],
      ]
    `)
    expect(result).toHaveLength(4)
  })
})

describe('difficult splits', () => {
  it('removes noisy end of a dataset', () => {
    const result = splitMultimodalDistribution({
      data: [...REAL_WORLD_DATA_9_SIMILAR_VERY_NOISY.data2, 5_500],
    })
    expect(result).toMatchInlineSnapshot(`
      Array [
        Array [
          544.7000000001863,
          557.5,
          567.0999999999767,
          575.3000000000466,
          592.8999999999069,
          609.7000000000116,
          621.5,
          648.2000000000698,
          686.0999999999767,
        ],
        Array [
          779.1000000000931,
          784.9000000000233,
        ],
        Array [
          1314,
        ],
        Array [
          1854.8000000000466,
          1911.9000000000233,
          1930.6999999999534,
          1995.4000000000233,
        ],
        Array [
          5500,
        ],
      ]
    `)
  })

  it('removes noisy end of a dataset 2', () => {
    const result = splitMultimodalDistribution({
      data: [...REAL_WORLD_DATA_9_SIMILAR_VERY_NOISY.data2, 3_500],
    })
    expect(result).toMatchInlineSnapshot(`
      Array [
        Array [
          544.7000000001863,
          557.5,
          567.0999999999767,
          575.3000000000466,
          592.8999999999069,
          609.7000000000116,
          621.5,
          648.2000000000698,
          686.0999999999767,
        ],
        Array [
          779.1000000000931,
          784.9000000000233,
        ],
        Array [
          1314,
        ],
        Array [
          1854.8000000000466,
          1911.9000000000233,
          1930.6999999999534,
          1995.4000000000233,
        ],
        Array [
          3500,
        ],
      ]
    `)
  })

  it('splits a multimodal dataset with a heavy beginning into unimodal datasets (2)', () => {
    const result = splitMultimodalDistribution({
      data: REAL_WORLD_DATA_9_SIMILAR_VERY_NOISY.data2,
    })
    expect(result).toMatchInlineSnapshot(`
      Array [
        Array [
          544.7000000001863,
          557.5,
          567.0999999999767,
          575.3000000000466,
          592.8999999999069,
          609.7000000000116,
          621.5,
          648.2000000000698,
          686.0999999999767,
        ],
        Array [
          779.1000000000931,
          784.9000000000233,
        ],
        Array [
          1314,
        ],
        Array [
          1854.8000000000466,
          1911.9000000000233,
          1930.6999999999534,
          1995.4000000000233,
        ],
      ]
    `)
    expect(result).toHaveLength(4)
  })
})
