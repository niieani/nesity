/* eslint-disable @typescript-eslint/method-signature-style */
/* eslint-disable @typescript-eslint/no-explicit-any */
type $Key = 0
type $Value = 1

export interface StrictMapInterface<KeyValuePairs extends readonly [any, any]>
  extends Map<KeyValuePairs[$Key], KeyValuePairs[$Value]> {
  /**
   * Executes a provided function once per each key/value pair in the Map, in insertion order.
   */
  forEach(
    callbackfn:
      | ((
          ...args: KeyValuePairs extends readonly [infer K, infer V]
            ? [V, K, this]
            : never
        ) => void)
      | ((
          ...args: KeyValuePairs extends readonly [infer K, infer V]
            ? [V, K]
            : never
        ) => void)
      | ((
          ...args: KeyValuePairs extends readonly [infer K, infer V]
            ? [V]
            : never
        ) => void),
    thisArg?: any,
  ): void
  /**
   * Returns a specified element from the Map object. If the value that is associated to the provided key is an object, then you will get a reference to that object and any change made to that object will effectively modify it inside the Map.
   * @returns Returns the element associated with the specified key. If no element is associated with the specified key, undefined is returned.
   */
  get<K extends KeyValuePairs[$Key]>(
    key: K,
  ): KeyValuePairs extends readonly [K, infer Value] ? Value | undefined : never
  /**
   * Adds a new element with a specified key and value to the Map. If an element with the same key already exists, the element will be updated.
   */
  set(
    ...args: KeyValuePairs extends readonly [infer K, infer V] ? [K, V] : never
  ): this
}

export interface StrictMapConstructor {
  readonly prototype: StrictMapInterface<any>
  new (): StrictMapInterface<any>
  new <KeyValuePairs extends readonly [any, any]>(
    entries?: readonly KeyValuePairs[] | null,
  ): StrictMapInterface<KeyValuePairs>
}

export const StrictMap: StrictMapConstructor = Map
