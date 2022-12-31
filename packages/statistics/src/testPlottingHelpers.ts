// eslint-disable-next-line import/no-extraneous-dependencies, node/no-unpublished-import
import { plot, PlotConfig } from 'asciichart'

/**
 * The function scales a set of numbers so that they are more human-readable.
 * It does this by dividing or multiplying the numbers by powers of 10 until they are either all integers,
 * or until some of the numbers have more than a certain number of digits after the decimal point (determined by the maxPrecision parameter).
 * This type of scaling might be useful in situations where you want to present a set of numbers to a user,
 * but the raw values are either very large or very small, and therefore not easily understandable.
 * By scaling the numbers, it becomes easier for the user to grasp the magnitude of the values and compare them to each other.
 */
export function scaleToIntegers(input: number[], maxPrecision = 3) {
  let factor = 1
  let transformed = [...input]
  // cutting of trailing zeroes:
  // divide array by 10 n-times until the largest number is lowest possible integer
  while (transformed.every((num) => Number.isInteger(num / 10))) {
    factor /= 10
    transformed = transformed.map((num) => num / 10)
  }
  if (factor === 1) {
    // cutting of leading zeroes:
    // multiply array by 10 n-times until the smallest number is the lowest possible unambiguous integer
    while (
      transformed.some(
        // eslint-disable-next-line @typescript-eslint/no-loop-func
        (num) =>
          num !== 0 &&
          (num < 1 ||
            (String(Math.round(num)).length < maxPrecision &&
              transformed.some(
                (otherNum) =>
                  otherNum !== num && Math.round(otherNum) === Math.round(num),
              ))),
      )
    ) {
      factor *= 10
      transformed = transformed.map((num) => num * 10)
    }
  }
  return { scaled: transformed.map(Math.round), factor }
}

export const asPlot = (values: number[], override?: PlotConfig) => {
  const { scaled, factor } = scaleToIntegers(values)
  const max = Math.max(...scaled)

  const plotted = plot(scaled, {
    height: 10,
    format: (n) => `${Math.round(n)}`.padStart(String(max).length, ' '),
    ...override,
  })
    .split('\n')
    .map((v) => v.trimEnd())
    .join('\n')

  return `\n${plotted}\n${factor !== 1 ? `Scaled by: ${factor}\n` : ''}`
}
