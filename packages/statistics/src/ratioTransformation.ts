/** values closer to zero count more */
export const complimentarySquare = (x: number, upperBound = 1) =>
  upperBound - (upperBound - x) * (upperBound - x)
/** values closer to zero count less */
export const square = (x: number) => x * x
/** no change */
export const linear = (x: number) => x
