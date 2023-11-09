/* eslint-disable @typescript-eslint/no-explicit-any */
import type { InferKeyOptionalityFromTupleType } from './utility.js'

type $Key = 0
type $Value = 1

export type fromEntriesType = <
  Tuples extends readonly [...(readonly (readonly [PropertyKey, any])[])],
>(
  entries: Tuples,
) => Tuples extends [...Tuples[number][]]
  ? {
      [K in Tuples[number][$Key]]?: (readonly [K, Tuples[number][$Value]] &
        Tuples[number])[$Value]
    }
  : {
      [K in keyof InferKeyOptionalityFromTupleType<Tuples[number]>]: (readonly [
        K,
        Tuples[number][$Value],
      ] &
        Tuples[number])[$Value]
    }

// eslint-disable-next-line prefer-destructuring
export const fromEntries: fromEntriesType = Object.fromEntries
