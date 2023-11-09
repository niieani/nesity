// eslint-disable-next-line node/no-unpublished-import,import/no-extraneous-dependencies
import { expectTypeOf } from 'expect-type'
import { StrictMap, StrictMapInterface } from './StrictMap.js'

const map = new StrictMap<['key1', 1] | ['key2', 2]>()

const value = map.get('key1')
expectTypeOf(value).toEqualTypeOf<1 | undefined>()

map.set('key1', 1)
map.set('key2', 2)

// @ts-expect-error should error
map.set('key2', 1)
// @ts-expect-error should error
map.set('unknown-key', 1)

// type constructed from tuples should be inferred correctly
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const fromEntries: typeof map = new StrictMap([
  ['key1', 1],
  ['key2', 2],
] as const)

const mixedValueMap = new StrictMap<['key1', 1] | ['key2', '2']>()

mixedValueMap.forEach((val, key, m) => {
  if (key === 'key2') {
    expectTypeOf(val).toEqualTypeOf<'2'>()
  }
  if (key === 'key1') {
    expectTypeOf(val).toEqualTypeOf<1>()
  }
  expectTypeOf(m).toEqualTypeOf<
    StrictMapInterface<['key1', 1] | ['key2', '2']>
  >()
})
