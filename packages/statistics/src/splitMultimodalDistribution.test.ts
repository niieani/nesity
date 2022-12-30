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
  UNIMODAL_SAMPLE,
  UNIMODAL_SAMPLE_NORMAL_DISTRIBUTION,
  UNIMODAL_SAMPLE_REAL,
} from './__fixtures__/testSamples'
import { splitMultimodalDistribution } from './splitMultimodalDistribution'

describe('multimodalDistribution', () => {
  it('keeps a unimodal dataset unchanged', () => {
    expect(splitMultimodalDistribution({ data: UNIMODAL_SAMPLE })).toEqual([
      UNIMODAL_SAMPLE,
    ])
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
    expect(splitMultimodalDistribution({ data: BIMODAL_SAMPLE })).toEqual([
      BIMODAL_SAMPLE_1,
      BIMODAL_SAMPLE_2,
    ])
  })

  it('splits a multimodal dataset into unimodal datasets', () => {
    const result = splitMultimodalDistribution({ data: MULTIMODAL_SAMPLE })
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
})
