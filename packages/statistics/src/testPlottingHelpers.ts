// eslint-disable-next-line import/no-extraneous-dependencies, node/no-unpublished-import
import { plot, PlotConfig } from 'asciichart'

export interface ScaleConfig {
  maxPrecision?: number
  factorAdjustment?: number
}

/**
 * The function scales a set of numbers so that they are more human-readable.
 * It does this by dividing or multiplying the numbers by powers of 10 until they are either all integers,
 * or until some of the numbers have more than a certain number of digits after the decimal point (determined by the maxPrecision parameter).
 * This type of scaling might be useful in situations where you want to present a set of numbers to a user,
 * but the raw values are either very large or very small, and therefore not easily understandable.
 * By scaling the numbers, it becomes easier for the user to grasp the magnitude of the values and compare them to each other.
 */
export function scaleToIntegers(
  input: number[],
  { maxPrecision = 3, factorAdjustment = 0 }: ScaleConfig = {},
) {
  let scale = 1
  let transformed = [...input]
  // cutting of trailing zeroes:
  // divide array by 10 n-times until the largest number is lowest possible integer
  while (transformed.every((num) => Number.isInteger(num / 10))) {
    scale /= 10
    transformed = transformed.map((num) => num / 10)
  }
  if (scale === 1) {
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
      scale *= 10
      transformed = transformed.map((num) => num * 10)
    }
  }
  while (factorAdjustment > 0) {
    scale *= 10
    transformed = transformed.map((num) => num * 10)
    // eslint-disable-next-line no-param-reassign
    factorAdjustment -= 1
  }
  while (factorAdjustment < 0) {
    scale /= 10
    transformed = transformed.map((num) => num / 10)
    // eslint-disable-next-line no-param-reassign
    factorAdjustment += 1
  }
  return { scaled: transformed.map(Math.round), scale }
}

export const asPlot = (
  values: number[],
  config: PlotConfig &
    ScaleConfig & { labels?: (string | number)[]; showLabel?: boolean } = {},
) => {
  let { labels } = config
  const {
    factorAdjustment,
    maxPrecision,
    showLabel = Boolean(labels),
    ...override
  } = config
  labels = labels ?? (showLabel ? values.map((v, i) => i) : undefined)

  const { scaled, scale } = scaleToIntegers(values, {
    factorAdjustment,
    maxPrecision,
  })
  const max = override.max ?? Math.max(...scaled)

  const plotted = plot(scaled, {
    height: 10,
    format: (n) => `${Math.round(n)}`.padStart(String(max).length, ' '),
    ...override,
  })
  const plottedAndFormatted = plotted
    .split('\n')
    .map((v) => v.trimEnd())
    .join('\n')
  const paddingLength = String(max).length + 1
  const padding = ' '.repeat(paddingLength)
  const labelSize = Math.max(...(labels ?? []).map((v) => String(v).length)) + 1
  const halfLabelSize1 = Math.floor(labelSize / 2)
  const halfLabelSize2 = Math.ceil(labelSize / 2)
  const label =
    showLabel && labels
      ? `\n${padding}${labels.reduce<string>(
          (text, v, i) =>
            labels!.length - 1 === i || text.length <= i + halfLabelSize1
              ? `${text.slice(0, -halfLabelSize1)}${String(v).padEnd(
                  labelSize + halfLabelSize2,
                  ' ',
                )}`
              : text,
          '',
        )}`.trimEnd()
      : ''
  return `\n${plottedAndFormatted}${label}\n${
    scale !== 1 ? `${padding}Scaled by: ${scale}\n` : ''
  }`
}
