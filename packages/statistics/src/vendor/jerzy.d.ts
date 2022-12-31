/* eslint-disable @typescript-eslint/no-extraneous-class */
declare module 'jerzy' {
  export const Normality: {
    shapiroWilk: (vector: Vector) => { p: number; w: number }
  }
  export class Vector {
    constructor(values: number[])
  }
}
