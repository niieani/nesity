import * as transforms from './ratioTransformation.js'
import { asPlot } from './testPlottingHelpers.js'

describe('ratioTransformation', () => {
  const width = 40
  const data = Array.from({ length: width + 1 }, (_, i) => i / width)
  const plotConfig = {
    min: 0,
    max: 100,
    labels: data.map((x) => Math.round(x * 100)),
    height: 20,
  }
  it('transforms linear', () => {
    expect(
      asPlot(data.map(transforms.linear), { maxPrecision: 2, ...plotConfig }),
    ).toMatchInlineSnapshot(`
"
100 ┼                                      ╭─
 95 ┤                                    ╭─╯
 90 ┤                                  ╭─╯
 85 ┤                                ╭─╯
 80 ┤                              ╭─╯
 75 ┤                            ╭─╯
 70 ┤                          ╭─╯
 65 ┤                        ╭─╯
 60 ┤                      ╭─╯
 55 ┤                    ╭─╯
 50 ┤                  ╭─╯
 45 ┤                ╭─╯
 40 ┤              ╭─╯
 35 ┤            ╭─╯
 30 ┤          ╭─╯
 25 ┤        ╭─╯
 20 ┤      ╭─╯
 15 ┤    ╭─╯
 10 ┤  ╭─╯
  5 ┤╭─╯
  0 ┼╯
    0   10  20  30  40  50  60  70  80  90  100
    Scaled by: 100
"
`)
  })
  it('transforms square', () => {
    expect(
      asPlot(data.map(transforms.square), {
        factorAdjustment: -2,
        ...plotConfig,
      }),
    ).toMatchInlineSnapshot(`
"
100 ┼                                       ╭
 95 ┤                                      ╭╯
 90 ┤                                     ╭╯
 85 ┤                                    ╭╯
 80 ┤                                   ╭╯
 75 ┤                                  ╭╯
 70 ┤                                ╭─╯
 65 ┤                               ╭╯
 60 ┤                              ╭╯
 55 ┤                            ╭─╯
 50 ┤                           ╭╯
 45 ┤                          ╭╯
 40 ┤                        ╭─╯
 35 ┤                      ╭─╯
 30 ┤                    ╭─╯
 25 ┤                  ╭─╯
 20 ┤                ╭─╯
 15 ┤              ╭─╯
 10 ┤          ╭───╯
  5 ┤      ╭───╯
  0 ┼──────╯
    0   10  20  30  40  50  60  70  80  90  100
    Scaled by: 100
"
`)
  })

  it('transforms complimentarySquare', () => {
    expect(
      asPlot(
        data.map((d) => transforms.complimentarySquare(d)),
        { maxPrecision: 2, ...plotConfig },
      ),
    ).toMatchInlineSnapshot(`
"
100 ┼                                 ╭──────
 95 ┤                             ╭───╯
 90 ┤                         ╭───╯
 85 ┤                       ╭─╯
 80 ┤                     ╭─╯
 75 ┤                   ╭─╯
 70 ┤                 ╭─╯
 65 ┤               ╭─╯
 60 ┤             ╭─╯
 55 ┤            ╭╯
 50 ┤           ╭╯
 45 ┤         ╭─╯
 40 ┤        ╭╯
 35 ┤       ╭╯
 30 ┤     ╭─╯
 25 ┤    ╭╯
 20 ┤   ╭╯
 15 ┤  ╭╯
 10 ┤ ╭╯
  5 ┤╭╯
  0 ┼╯
    0   10  20  30  40  50  60  70  80  90  100
    Scaled by: 100
"
`)
  })
})
