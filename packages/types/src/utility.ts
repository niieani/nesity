/* eslint-disable @typescript-eslint/no-explicit-any */

export type IsUnion<T, U extends T = T> = T extends unknown
  ? [U] extends [T]
    ? false
    : true
  : false

export type IfUnion<T, Yes, No> = true extends IsUnion<T> ? Yes : No

export type UnionToIntersection<U> = (
  U extends any ? (k: U) => void : never
) extends (k: infer I) => void
  ? I
  : never

export type InferKeyOptionalityFromTupleType<
  Tuple extends readonly [PropertyKey, any],
> = UnionToIntersection<
  Tuple extends [any, any]
    ? { [K in Tuple[0]]?: any }
    : IfUnion<Tuple[0], { [K in Tuple[0]]?: any }, { [K in Tuple[0]]: any }>
>
