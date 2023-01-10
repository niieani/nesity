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
  UNIMODAL_SAMPLE,
  UNIMODAL_SAMPLE_NORMAL_DISTRIBUTION,
  UNIMODAL_SAMPLE_REAL,
} from './__fixtures__/testSamples'
import { splitMultimodalDistribution } from './splitMultimodalDistribution'
import * as utilities from './utilities'

const random = utilities.getStableRandom()

describe.each([0, 1, 2, 3])(
  'splitMultimodalDistribution (noiseValuesPerSample %i)',
  (noiseValuesPerSample) => {
    it('keeps a unimodal dataset unchanged', () => {
      expect(
        splitMultimodalDistribution({
          data: UNIMODAL_SAMPLE,
          noiseValuesPerSample,
          random,
        }),
      ).toEqual([UNIMODAL_SAMPLE])
    })

    it('keeps a unimodal normally distributed dataset unchanged', () => {
      expect(
        splitMultimodalDistribution({
          data: UNIMODAL_SAMPLE_NORMAL_DISTRIBUTION,
          noiseValuesPerSample,
          random,
        }),
      ).toEqual([UNIMODAL_SAMPLE_NORMAL_DISTRIBUTION])
    })

    it('keeps another unimodal normally distributed dataset unchanged', () => {
      expect(
        splitMultimodalDistribution({
          data: UNIMODAL_SAMPLE_REAL,
          noiseValuesPerSample,
          random,
        }),
      ).toEqual([UNIMODAL_SAMPLE_REAL])
    })

    it('splits a bimodal dataset into unimodal datasets', () => {
      expect(
        splitMultimodalDistribution({
          data: BIMODAL_SAMPLE,
          noiseValuesPerSample,
          random,
        }),
      ).toEqual([BIMODAL_SAMPLE_1, BIMODAL_SAMPLE_2])
    })

    it('splits a multimodal dataset into unimodal datasets', () => {
      const result = splitMultimodalDistribution({
        data: MULTIMODAL_SAMPLE,
        noiseValuesPerSample,
        random,
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
        noiseValuesPerSample,
        random,
      })
      expect(result).toHaveLength(3)
      expect(result).toEqual([
        [...MULTIMODAL_SAMPLE_BEGINNING, ...MULTIMODAL_SAMPLE_1],
        MULTIMODAL_SAMPLE_2,
        MULTIMODAL_SAMPLE_3,
      ])
    })
  },
)

describe('difficult splits', () => {
  it('splits a multimodal dataset with a heavy beginning into unimodal datasets (2)', () => {
    const result = splitMultimodalDistribution({
      data: REAL_WORLD_DATA_9_SIMILAR_VERY_NOISY.data2,
      noiseValuesPerSample: 3,
      random,
      kernelStretchFactor: 0.5,
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
    // expect(result).toHaveLength(3)
    // expect(result).toEqual([
    //   [...MULTIMODAL_SAMPLE_BEGINNING, ...MULTIMODAL_SAMPLE_1],
    //   MULTIMODAL_SAMPLE_2,
    //   MULTIMODAL_SAMPLE_3,
    // ])
  })
})
