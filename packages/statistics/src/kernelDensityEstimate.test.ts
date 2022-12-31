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
import { asPlot } from './testPlottingHelpers'

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
    // prettier-ignore
    expect(asPlot(densityEstimate)).toMatchInlineSnapshot(`
"
979 ┤  ╭───╮
941 ┤  │   │
902 ┤ ╭╯   ╰╮
864 ┤ │     │
825 ┤ │     │
787 ┤╭╯     ╰╮
748 ┤│       │
710 ┤│       │
671 ┤│       │
633 ┤│       │
594 ┼╯       ╰
Scaled by: 1000000
"
`)
  })

  it('should return the correct kernel density estimate for a normally distributed unimodal sample', () => {
    const densityEstimate = kernelDensityEstimate({
      sortedData: UNIMODAL_SAMPLE_NORMAL_DISTRIBUTION,
    })
    // prettier-ignore
    expect(asPlot(densityEstimate)).toMatchInlineSnapshot(`
"
437 ┤     ╭──────╮
398 ┤   ╭─╯      ╰╮
359 ┤  ╭╯         │
320 ┤ ╭╯          ╰╮
281 ┤ │            ╰─╮
243 ┤ │              │
204 ┤╭╯              │
165 ┤│               ╰╮
126 ┤│                ╰─
 87 ┤│
 48 ┼╯
Scaled by: 100000
"
`)
  })

  it('should return the correct kernel density estimate for another normally distributed unimodal sample', () => {
    const densityEstimate = kernelDensityEstimate({
      sortedData: UNIMODAL_SAMPLE_REAL,
    })
    // prettier-ignore
    expect(asPlot(densityEstimate)).toMatchInlineSnapshot(`
"
1134 ┤       ╭────────────╮
1048 ┤     ╭─╯            ╰──╮
 961 ┤     │                 ╰─╮
 875 ┤   ╭─╯                   ╰╮
 788 ┤  ╭╯                      │
 702 ┤╭─╯                       ╰──╮
 616 ┤│                            │
 529 ┤│                            │
 443 ┤│                            │
 356 ┼╯                            ╰╮
 270 ┤                              ╰
Scaled by: 100000
"
`)
  })

  it('should return the correct kernel density estimate for a bimodal sample', () => {
    const densityEstimate = kernelDensityEstimate({
      sortedData: BIMODAL_SAMPLE,
    })
    // prettier-ignore
    expect(asPlot(densityEstimate)).toMatchInlineSnapshot(`
"
840 ┤   ╭╮
826 ┤   ││   ╭──╮
813 ┤  ╭╯╰╮ ╭╯  ╰╮
799 ┤  │  ╰╮│    │
786 ┤  │   ╰╯    │
772 ┤ ╭╯         ╰╮
758 ┤ │           │
745 ┤ │           │
731 ┤ │           │
718 ┤ │           ╰
704 ┼─╯
Scaled by: 1000000
"
`)
  })

  it('should return the correct kernel density estimate for a multimodal sample', () => {
    const densityEstimate = kernelDensityEstimate({
      sortedData: MULTIMODAL_SAMPLE,
    })
    // prettier-ignore
    expect(asPlot(densityEstimate)).toMatchInlineSnapshot(`
"
510 ┤  ╭╮
497 ┤  │╰╮
484 ┤ ╭╯ ╰╮  ╭───╮
471 ┤ │   │  │   ╰╮ ╭───╮
458 ┤ │   ╰╮╭╯    │ │   ╰╮
446 ┼─╯    ╰╯     ╰╮│    │
433 ┤              ││    ╰
420 ┤              ││
407 ┤              ││
394 ┤              ││
381 ┤              ╰╯
Scaled by: 1000000
"
`)
  })

  it('should return the correct kernel density estimate for a multimodal sample with heavy beginning', () => {
    const densityEstimate = kernelDensityEstimate({
      sortedData: MULTIMODAL_SAMPLE_HEAVY_BEGINNING,
    })
    // prettier-ignore
    expect(asPlot(densityEstimate)).toMatchInlineSnapshot(`
"
783 ┤       ╭─╮
736 ┼───────╯ │
689 ┤         ╰╮
642 ┤          │
595 ┤          ╰╮
549 ┤           ╰╮
502 ┤            ╰╮
455 ┤             │
408 ┤             │╭────╮ ╭───╮
361 ┤             ╰╯    ╰╮│   ╰─
314 ┤                    ╰╯
Scaled by: 1000000
"
`)
  })
})

describe('optimalThreshold', () => {
  it('find the right quantile when presented with multimodal data', () => {
    const threshold = optimalThreshold({
      sortedData: MULTIMODAL_SAMPLE_HEAVY_BEGINNING,
    })
    expect(threshold.p).toBeCloseTo(0.93)
    expect(threshold.stdev).toBeCloseTo(1_523.93)
    expect(threshold.value).toBeCloseTo(375)
  })
  it('fallback to stdev in naturally distributed data', () => {
    const threshold = optimalThreshold({
      sortedData: UNIMODAL_SAMPLE_NORMAL_DISTRIBUTION,
    })
    expect(threshold.p).toBeNaN()
    expect(threshold.stdev).toBeCloseTo(89.88)
    expect(threshold.value).toBeCloseTo(89.88)
  })
})
