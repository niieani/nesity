# nesity-types

A set of TypeScript utilities that help you write stricter code.

## Installation

```bash
yarn install nesity-types
```

## Functionality

### Enhanced built-in types

The code at runtime is the same as the underlying method, only the types are stricter.

#### `fromEntries`

A strict typing of `Object.fromEntries` (see [issue @ TypeScript repo](https://github.com/microsoft/TypeScript/issues/50379))

```ts
import { fromEntries } from 'nesity-types'

const x = fromEntries([['a', 1] as const, ['b', 2] as const] as const)

// note that these values need to be readonly tuples for this to work
// the type of x is now: { a: 1, b: 2 }
```

If you wish to upgrade the native `Object.fromEntries` with the stricter version, you can do so by referencing the `fromEntriesLib.d.ts` file:

```ts
/// <reference path="nesity-types/src/fromEntriesLib" />
```

#### `StrictMap`

A strict typing of the built-in `Map` for cases where a specific Key maps to a specific Value.

```ts
import { StrictMap } from 'nesity-types'

// prettier-ignore
type PossibleTuples =
  | ['key', 'value']
  | ['another-key', 'another-value']

const map = new StrictMap<PossibleTuples>()

// valid:
map.set('key', 'value')
map.set('another-key', 'another-value')
map.get('key') // 'value'

// invalid:
map.set('key', 'another-value')
map.set('wrong-key', 'value')
map.set('key', 'wrong-value')
map.get('wrong-key') // undefined
```

### Utility types

- `IsUnion` - a type that checks whether a type is a union type
- `IfUnion` - a type that returns a different type depending on whether the type is a union type
- `UnionToIntersection` - a type that converts a union type to an intersection type
- `InferKeyOptionalityFromTupleType` - a type that infers whether a key in a tuple type is optional or not
