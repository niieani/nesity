import { plot, PlotConfig } from 'asciichart'
import {
  BIMODAL_SAMPLE,
  MULTIMODAL_SAMPLE,
  MULTIMODAL_SAMPLE_HEAVY_BEGINNING,
  UNIMODAL_SAMPLE,
  UNIMODAL_SAMPLE_NORMAL_DISTRIBUTION,
} from './__fixtures__/testSamples'
import {
  kernelDensityEstimateForNormalDistribution,
  optimalThreshold,
} from './kernelDensityEstimate'

const PLOT_CONFIG: PlotConfig = {
  height: 10,
  format: (n) => `${Math.round(n * 10_000)}`.padStart(3, ' '),
}

describe('kernelDensityEstimateForNormalDistribution', () => {
  it('should correctly calculate the KDE', () => {
    const data = [93, 93, 96, 100, 101, 102, 102]
    const densityEstimate = kernelDensityEstimateForNormalDistribution({
      sortedData: data,
    })
    expect(densityEstimate).toMatchInlineSnapshot(`
      Array [
        0.060605274685025204,
        0.060605274685025204,
        0.05532135671935776,
        0.08735319797805376,
        0.09511038127889694,
        0.09016756371575972,
        0.09016756371575972,
      ]
    `)
  })

  it('should return the correct kernel density estimate for a unimodal sample', () => {
    const densityEstimate = kernelDensityEstimateForNormalDistribution({
      sortedData: UNIMODAL_SAMPLE,
    })
    const plotted = plot(densityEstimate, PLOT_CONFIG)
      .split('\n')
      .map((v) => v.trimEnd())
      .join('\n')

    // prettier-ignore
    expect(`\n${plotted}\n`).toMatchInlineSnapshot(`
"
 10 ┤   ╭─╮
 10 ┤  ╭╯ ╰╮
  9 ┤ ╭╯   ╰╮
  9 ┤ │     │
  8 ┤ │     │
  8 ┤╭╯     ╰╮
  8 ┤│       │
  7 ┤│       │
  7 ┤│       │
  7 ┤│       │
  6 ┼╯       ╰
"
`)
  })

  it('should return the correct kernel density estimate for a normally distributed unimodal sample', () => {
    const densityEstimate = kernelDensityEstimateForNormalDistribution({
      sortedData: UNIMODAL_SAMPLE_NORMAL_DISTRIBUTION,
    })
    const plotted = plot(densityEstimate, PLOT_CONFIG)
      .split('\n')
      .map((v) => v.trimEnd())
      .join('\n')
    // prettier-ignore
    expect(`\n${plotted}\n`).toMatchInlineSnapshot(`
"
 49 ┤     ╭────╮
 44 ┤    ╭╯    ╰─╮
 40 ┤   ╭╯       ╰╮
 36 ┤ ╭─╯         │
 31 ┤ │           ╰╮
 27 ┤ │            ╰─╮
 23 ┤ │              │
 18 ┤╭╯              ╰╮
 14 ┤│                ╰─
 10 ┤│
  5 ┼╯
"
`)
  })

  it('should return the correct kernel density estimate for a bimodal sample', () => {
    const densityEstimate = kernelDensityEstimateForNormalDistribution({
      sortedData: BIMODAL_SAMPLE,
    })
    const plotted = plot(densityEstimate, PLOT_CONFIG)
      .split('\n')
      .map((v) => v.trimEnd())
      .join('\n')
    // prettier-ignore
    expect(`\n${plotted}\n`).toMatchInlineSnapshot(`
"
 10 ┤        ╭───╮
 10 ┤        │   │
 10 ┤  ╭─╮   │   ╰╮
  9 ┤  │ │  ╭╯    │
  9 ┤  │ ╰╮ │     │
  9 ┤ ╭╯  │ │     │
  9 ┤ │   │ │     │
  9 ┤ │   ╰╮│     ╰
  8 ┤ │    ││
  8 ┤╭╯    ╰╯
  8 ┼╯
"
`)
  })

  it('should return the correct kernel density estimate for a multimodal sample', () => {
    const densityEstimate = kernelDensityEstimateForNormalDistribution({
      sortedData: MULTIMODAL_SAMPLE,
    })
    const plotted = plot(densityEstimate, PLOT_CONFIG)
      .split('\n')
      .map((v) => v.trimEnd())
      .join('\n')

    // prettier-ignore
    expect(`\n${plotted}\n`).toMatchInlineSnapshot(`
"
  6 ┤  ╭─╮   ╭───╮
  6 ┤  │ │   │   ╰╮ ╭───╮
  6 ┤ ╭╯ ╰╮ ╭╯    │ │   ╰╮
  6 ┤ │   │ │     ╰╮│    │
  5 ┤ │   ╰╮│      ││    │
  5 ┼─╯    ╰╯      ││    ╰
  5 ┤              ││
  5 ┤              ││
  5 ┤              ││
  4 ┤              ││
  4 ┤              ╰╯
"
`)
  })

  it('should return the correct kernel density estimate for a multimodal sample with heavy beginning', () => {
    const densityEstimate = kernelDensityEstimateForNormalDistribution({
      sortedData: MULTIMODAL_SAMPLE_HEAVY_BEGINNING,
    })
    const plotted = plot(densityEstimate, PLOT_CONFIG)
      .split('\n')
      .map((v) => v.trimEnd())
      .join('\n')

    // prettier-ignore
    expect(`\n${plotted}\n`).toMatchInlineSnapshot(`
"
 10 ┼─────────╮
  9 ┤         │
  8 ┤         │
  8 ┤         ╰╮
  7 ┤          ╰╮
  6 ┤           │
  6 ┤           ╰─╮╭───╮
  5 ┤             ╰╯   ╰╮ ╭────╮
  5 ┤                   ╰╮│    ╰
  4 ┤                    ││
  3 ┤                    ╰╯
"
`)
  })
})

describe('optimalThreshold', () => {
  it('find the right quantile when presented with multimodal data', () => {
    const threshold = optimalThreshold(MULTIMODAL_SAMPLE_HEAVY_BEGINNING)
    expect(threshold.p).toBeCloseTo(0.93)
    expect(threshold.stdev).toBeCloseTo(1_523.93)
    expect(threshold.value).toBeCloseTo(375)
  })
  it('fallback to stdev in naturally distributed data', () => {
    const threshold = optimalThreshold(UNIMODAL_SAMPLE_NORMAL_DISTRIBUTION)
    expect(threshold.p).toBeNaN()
    expect(threshold.stdev).toBeCloseTo(89.88)
    expect(threshold.value).toBeCloseTo(89.88)
  })
})
