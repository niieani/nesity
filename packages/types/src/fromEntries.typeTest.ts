// eslint-disable-next-line node/no-unpublished-import,import/no-extraneous-dependencies
import { expectTypeOf } from 'expect-type'
import { fromEntries } from './fromEntries'

// const tuples:
const obj1 = fromEntries([
  //    ^?
  ['key1', 1],
  ['key2', 2],
] as const)

expectTypeOf(obj1).toEqualTypeOf<{ key1: 1; key2: 2 }>()

// const tuples with mixed types:
const obj2 = fromEntries([
  //    ^?
  ['key1', 1],
  ['key2string', '2'],
] as const)

expectTypeOf(obj2).toEqualTypeOf<{ key1: 1; key2string: '2' }>()

// mutable array of const tuples cannot guarrantee existence:
const obj1FromMutable = fromEntries([
  //    ^?
  ['key1', 1] as const,
  ['key2', 2] as const,
])

expectTypeOf(obj1FromMutable).toEqualTypeOf<{ key1?: 1; key2?: 2 }>()

// mutable arrays of mutable tuples cannot guarrantee existence, but can infer generalized type:
const obj2FromMutable = fromEntries([
  //    ^?
  ['key1', 1] as const,
  ['key2string', '2'] as const,
])

expectTypeOf(obj2FromMutable).toEqualTypeOf<{ key1?: 1; key2string?: '2' }>()

// mutable arrays of mixed const and mutable tuples work correctly:
const obj2FromMixed = fromEntries([
  //    ^?
  ['key1', 1] as const,
  ['key2string', '2'],
])

expectTypeOf(obj2FromMixed).toEqualTypeOf<
  Record<string, string | 1 | undefined>
>()

declare const mutableTuple: [['key1', 1], ['key2', '2']]
const fromMutable = fromEntries(mutableTuple)

expectTypeOf(fromMutable).toEqualTypeOf<{
  key1?: 1
  key2?: '2'
}>()

declare const immutableTuple: readonly [
  readonly ['key1', 1],
  readonly ['key2', '2'],
]
const fromImmutable = fromEntries(immutableTuple)
expectTypeOf(fromImmutable).toEqualTypeOf<{
  key1: 1
  key2: '2'
}>()

declare const mixedTuple: readonly [['key1', 1], readonly ['key2', '2']]
const mixed = fromEntries(mixedTuple)
expectTypeOf(mixed).toEqualTypeOf<{
  key1?: 1
  key2: '2'
}>()

declare const tupleWithUnionKeys: readonly [
  ['key1' | 'key3', 1],
  readonly ['key2' | 'key9', '2'],
]
const withUnionKeys = fromEntries(tupleWithUnionKeys)
expectTypeOf(withUnionKeys).toEqualTypeOf<{
  key1?: 1
  key2?: '2'
  key3?: 1
  key9?: '2'
}>()

declare const tupleArray: readonly (['key', 'value'] | ['huh', 'hmm'])[]
const fromArray = fromEntries(tupleArray)
expectTypeOf(fromArray).toEqualTypeOf<{
  key?: 'value'
  huh?: 'hmm'
}>()
