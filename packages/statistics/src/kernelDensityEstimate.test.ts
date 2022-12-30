import { plot, PlotConfig } from 'asciichart'
import {
  BIMODAL_SAMPLE,
  MULTIMODAL_SAMPLE,
  MULTIMODAL_SAMPLE_HEAVY_BEGINNING,
  UNIMODAL_SAMPLE,
  UNIMODAL_SAMPLE_NORMAL_DISTRIBUTION,
  UNIMODAL_SAMPLE_REAL,
} from './__fixtures__/testSamples'
import {
  kernelDensityEstimate,
  optimalThreshold,
} from './kernelDensityEstimate'

const PLOT_CONFIG: PlotConfig = {
  height: 10,
  format: (n) => `${Math.round(n * 10_000)}`.padStart(3, ' '),
}

describe('kernelDensityEstimateForNormalDistribution', () => {
  it('should correctly calculate the KDE', () => {
    const data = [93, 93, 96, 100, 101, 102, 102]
    const densityEstimate = kernelDensityEstimate({
      sortedData: data,
    })
    expect(densityEstimate).toMatchInlineSnapshot(`
      Array [
        0.05190959710900418,
        0.05190959710900418,
        0.05965428920481614,
        0.07793877696845898,
        0.07909126512329022,
        0.07452605896121355,
        0.07452605896121355,
      ]
    `)
  })

  it('should return the correct kernel density estimate for a unimodal sample', () => {
    const densityEstimate = kernelDensityEstimate({
      sortedData: UNIMODAL_SAMPLE,
    })
    const plotted = plot(densityEstimate, PLOT_CONFIG)
      .split('\n')
      .map((v) => v.trimEnd())
      .join('\n')

    // prettier-ignore
    expect(`\n${plotted}\n`).toMatchInlineSnapshot(`
"
 10 ┤  ╭───╮
  9 ┤  │   │
  9 ┤ ╭╯   ╰╮
  9 ┤ │     │
  8 ┤ │     │
  8 ┤╭╯     ╰╮
  7 ┤│       │
  7 ┤│       │
  7 ┤│       │
  6 ┤│       │
  6 ┼╯       ╰
"
`)
  })

  it('should return the correct kernel density estimate for a normally distributed unimodal sample', () => {
    const densityEstimate = kernelDensityEstimate({
      sortedData: UNIMODAL_SAMPLE_NORMAL_DISTRIBUTION,
    })
    const plotted = plot(densityEstimate, PLOT_CONFIG)
      .split('\n')
      .map((v) => v.trimEnd())
      .join('\n')
    // prettier-ignore
    expect(`\n${plotted}\n`).toMatchInlineSnapshot(`
"
 44 ┤     ╭──────╮
 40 ┤   ╭─╯      ╰╮
 36 ┤  ╭╯         │
 32 ┤ ╭╯          ╰╮
 28 ┤ │            ╰─╮
 24 ┤ │              │
 20 ┤╭╯              │
 16 ┤│               ╰╮
 13 ┤│                ╰─
  9 ┤│
  5 ┼╯
"
`)
  })

  it('should return the correct kernel density estimate for another normally distributed unimodal sample', () => {
    const densityEstimate = kernelDensityEstimate({
      sortedData: UNIMODAL_SAMPLE_REAL,
    })
    const plotted = plot(densityEstimate, PLOT_CONFIG)
      .split('\n')
      .map((v) => v.trimEnd())
      .join('\n')
    // prettier-ignore
    expect(`\n${plotted}\n`).toMatchInlineSnapshot(`
"
113 ┤        ╭───────────╮
105 ┤     ╭──╯           ╰──╮
 96 ┤     │                 ╰─╮
 87 ┤   ╭─╯                   ╰╮
 79 ┤  ╭╯                      │
 70 ┤╭─╯                       ╰──╮
 62 ┤│                            │
 53 ┤│                            │
 44 ┤│                            │
 36 ┼╯                            ╰╮
 27 ┤                              ╰
"
`)
  })

  it('should return the correct kernel density estimate for a bimodal sample', () => {
    const densityEstimate = kernelDensityEstimate({
      sortedData: BIMODAL_SAMPLE,
    })
    const plotted = plot(densityEstimate, PLOT_CONFIG)
      .split('\n')
      .map((v) => v.trimEnd())
      .join('\n')
    // prettier-ignore
    expect(`\n${plotted}\n`).toMatchInlineSnapshot(`
"
  8 ┤   ╭╮
  8 ┤   ││   ╭──╮
  8 ┤  ╭╯╰╮ ╭╯  ╰╮
  8 ┤  │  ╰╮│    │
  8 ┤  │   ╰╯    │
  8 ┤ ╭╯         ╰╮
  8 ┤ │           │
  7 ┤ │           │
  7 ┤ │           │
  7 ┤ │           │
  7 ┼─╯           ╰
"
`)
  })

  it('should return the correct kernel density estimate for a multimodal sample', () => {
    const densityEstimate = kernelDensityEstimate({
      sortedData: MULTIMODAL_SAMPLE,
    })
    const plotted = plot(densityEstimate, PLOT_CONFIG)
      .split('\n')
      .map((v) => v.trimEnd())
      .join('\n')

    // prettier-ignore
    expect(`\n${plotted}\n`).toMatchInlineSnapshot(`
"
  5 ┤  ╭─╮
  5 ┤ ╭╯ ╰╮   ╭──╮
  5 ┤ │   │  ╭╯  ╰╮ ╭───╮
  5 ┤ │   ╰╮╭╯    │ │   ╰╮
  5 ┼─╯    ╰╯     ╰╮│    │
  4 ┤              ││    │
  4 ┤              ││    ╰
  4 ┤              ││
  4 ┤              ││
  4 ┤              ││
  4 ┤              ╰╯
"
`)
  })

  it('should return the correct kernel density estimate for a multimodal sample with heavy beginning', () => {
    const densityEstimate = kernelDensityEstimate({
      sortedData: MULTIMODAL_SAMPLE_HEAVY_BEGINNING,
    })
    const plotted = plot(densityEstimate, PLOT_CONFIG)
      .split('\n')
      .map((v) => v.trimEnd())
      .join('\n')

    // prettier-ignore
    expect(`\n${plotted}\n`).toMatchInlineSnapshot(`
"
  8 ┤       ╭─╮
  7 ┼───────╯ │
  7 ┤         ╰╮
  6 ┤          │
  6 ┤          ╰╮
  5 ┤           ╰╮
  5 ┤            ╰╮
  5 ┤             │
  4 ┤             │╭────╮ ╭───╮
  4 ┤             ╰╯    ╰╮│   ╰─
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
