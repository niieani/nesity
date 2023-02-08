/* eslint-disable @typescript-eslint/no-explicit-any */
type $Key = 0
type $Value = 1

interface ObjectConstructor {
  /**
   * Returns an object created by key-value entries for properties and methods
   * @param entries An iterable object that contains key-value entries for properties and methods.
   */
  // eslint-disable-next-line @typescript-eslint/method-signature-style
  fromEntries<
    Tuples extends readonly [...(readonly (readonly [PropertyKey, any])[])],
  >(
    entries: Tuples,
  ): Tuples extends [...Tuples[number][]]
    ? {
        [K in Tuples[number][$Key]]?: (readonly [K, Tuples[number][$Value]] &
          Tuples[number])[$Value]
      }
    : {
        [K in keyof import('./utility').InferKeyOptionalityFromTupleType<
          Tuples[number]
        >]: (readonly [K, Tuples[number][$Value]] & Tuples[number])[$Value]
      }
}
