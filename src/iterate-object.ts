/**
 * Object.entries polyfill.
 *
 * This may be deprecated, but was added in the first place to support multiple node versions.
 *
 * @param object
 * @returns
 */
export const iterateObject = <K extends string | number | symbol, V extends any>(
  object: Record<K, V>,
): Array<[K, V]> => {
  if (!object) {
    return [];
  }
  if (typeof Object.entries === 'function') {
    return Object.entries(object) as Array<[K, V]>;
  }
  return Object.keys(object).map((key) => [key as K, object[key as K]]);
};
