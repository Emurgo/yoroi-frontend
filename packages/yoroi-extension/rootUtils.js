// @flow

export function mapOwnProperties<K, V, R>(obj: { [K]: V }, fn: ((V, K) => R) ): Array<R> {
  return Object.keys(obj)
    .filter(key => objHasOwnProperty(obj, key))
    .map(key => fn(obj[key], key));
}

export function objHasOwnProperty(obj: any, key: any): boolean {
  // $FlowFixMe[method-unbinding]
  return Object.prototype.hasOwnProperty.call(obj, key);
}