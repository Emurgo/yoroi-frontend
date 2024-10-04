// @flow

export function bytesToHex(bytes: *): string {
  return Buffer.from(bytes).toString('hex');
}

export function bytesToBase64(bytes: *): string {
  return Buffer.from(bytes).toString('base64');
}

export function hexToBytes(hex: string): Buffer {
  return Buffer.from(hex, 'hex');
}

export function hexToUtf(hex: string): string {
  return hexToBytes(hex).toString('utf-8');
}

export function utfToBytes(utf: string): Buffer {
  return Buffer.from(utf, 'utf-8');
}

export function logErr<T>(f: () => T, msg: (string | (Error) => string)): T {
  try {
    return f();
  } catch (e) {
    console.error(typeof msg === 'string' ? msg : msg(e), e);
    throw e;
  }
}

/**
 * In case the URL is at the IPFS protocol it will be resolved into HTTPS.
 * In any other case there will be no change in the returned result.
 */
export function urlResolveForIpfsAndCorsproxy<T: ?string>(url: T): T {
  // $FlowIgnore
  return maybe(url, (u: string): string => u.startsWith('ipfs://')
    ? u.replace('ipfs://', 'https://ipfs.io/ipfs/')
    : `https://corsproxy.io/?${u}`);
}

/**
 * Creates a function like Predicate<T> which will filter out duplicates.
 * Can be used to pass into higher order collection calls like `.filter`.
 *
 * @param getter - a function that resolves every element T
 *  into the value that will be used for the uniqueness check. Identity by default.
 * @return {function(*)} - that takes any elements T and returns false
 *  in case it duplicates any previously passed element. True by default.
 */
export function createFilterUniqueBy<T>(getter: T => any = x => x): T => boolean {
  const set = new Set();
  return t => {
    const k = getter(t);
    // false && <ignored> - when set already has entry
    // true && set.add - when doesn't have
    return !set.has(k) && set.add(k) && true;
  }
}

/**
 * Creates a comparator function that applies the provided `getter` to all values and compares the getter results
 */
export function comparatorByGetter<T>(getter: T => any): (T, T) => number {
  return (a: T, b: T) => {
    const [aV, bV] = [getter(a), getter(b)];
    if (aV < bV) return -1;
    if (aV > bV) return 1;
    return 0;
  }
}

/**
 * Calls `Object.values` and performs force type-casting.
 *
 * @param obj - any object
 * @return {Array<T>} - the array of values force-casted as T
 */
export function listValues<T>(obj: { [any]: T }): Array<T> {
  return ((Object.values(obj): any): T[]);
}

/**
 * Calls `Object.entries` and performs force type-casting.
 *
 * @param obj - any object
 * @return {Array<[K,V]>} - the array of tuples force-casted as [K,V]
 */
export function listEntries<K,V>(obj: { [K]: V }): Array<[K,V]> {
  return ((Object.entries(obj): any): Array<[K,V]>);
}

/**
 * Returns a sorted copy
 */
export function sorted<T>(arr: T[], f?: (a: T, b: T) => number): T[] {
  const res = [...arr];
  res.sort(f);
  return res;
}

export function first<T>(arr: T[]): ?T {
  return arr[0];
}

export function second<T>(arr: T[]): ?T {
  return arr[1];
}

export function last<T>(arr: T[]): ?T {
  return arr[arr.length - 1];
}

/**
 * Aggregates an array of key-value tuples into a map
 */
export function entriesIntoMap<K,V>(col: Array<[K,V]>): { [K]: V } {
  return entriesIntoMapBy<[K,V],K,V>(col, x => x);
}

/**
 * Converts each object in the array into a key-value tuple, using the provided function,
 * and then aggregates tuples into a map
 */
export function entriesIntoMapBy<T,K,V>(col: Array<T>, f: (T => [K,V])): { [K]: V } {
  return col.reduce((map, e) => {
    const [k, v]: [K, V] = f(e);
    map[k] = v;
    return map;
  },({}: { [K]: V }));
}

/**
 * Maps t if != null, otherwise returns same t
 */
export function maybe<T,R>(t: ?T, f: T => ?R): ?R {
  return t == null ? t : f(t);
}

/**
 * Composes two functions in a null-safe manner
 */
export function compose<A,B,C>(f1: A => ?B, f2: B => ?C): (A => ?C) {
  return a => maybe(f1(a), f2);
}

/**
 * Does nothing
 */
export function noop(..._: any[]): void {
  // noop
}

/**
 * Throws an error
 */
export function fail<T>(...params: any[]): T {
  throw new Error(...params);
}

/**
 * Returns the passed argument with no changes and just force-casts it to defined type
 */
export function forceNonNull<T>(t: ?T): T {
  // $FlowIgnore
  return t;
}

/**
 * Returns the passed argument with no changes and just force-casts it to defined type
 */
export function cast<T>(t: any): T {
  // $FlowIgnore
  return t;
}

/**
 * Stringifies and then parses the passed argument, removing any functions or proxies
 */
export function purify<T>(t: any): T {
  return JSON.parse(JSON.stringify(t));
}

/**
 * Async pause, does nothing except stops time and yields when awaited
 */
export async function delay(time: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, time));
}

/**
 * Returns true in case the argument is an empty array
 */
export function isEmptyArray(t: any): boolean {
  return Array.isArray(t) && t.length === 0;
}

/**
 * Wraps sync or async func and returns another func that caches results for the specified time
 *
 * @param fun - the original function to be wrapped and cached
 * @param ttl - caching time millis: no caching if zero, infinite caching if negative
 * @return {function(): (R)} - wrapped caching function
 */
export function timeCached<R>(fun: () => R, ttl: number): () => R {
  const cache: [?{| value: R, time: number |}] = [null];
  return () => {
    const time = Date.now();
    if (cache[0] != null && ttl !== 0) {
      if (ttl < 0 || time < (cache[0].time + ttl)) {
        return cache[0].value;
      }
    }
    const value = fun();
    cache[0] = { value, time };
    return value;
  }
}

/**
 * Makes sure the result is an array.
 * Either returns the passed array or wraps the item into an array.
 * Might be useful with flat-mapping.
 */
export function ensureArray<T>(t: T | Array<T>): Array<T> {
  // $FlowIgnore
  return Array.isArray(t) ? t : [t];
}

export type LenGet<T> = { +len: () => number, +get: number => T, ... };
export type LenGetMap<K,V> = { +keys: () => LenGet<K>, +get: K => V, ... };

export function iterateLenGet<T>(lenget: ?LenGet<T>): ExtendedIterable<T> {
  return ExtendedIterable.from<T>((function*() {
    if (lenget != null) {
      const len = lenget.len();
      for (let i = 0; i < len; i++) {
        yield lenget.get(i);
      }
    }
  })());
}

export function iterateLenGetMap<K, V>(map: ?LenGetMap<K,V>): ExtendedIterableMap<K, V> {
  return ExtendedIterableMap.fromTuples<K,V>((function*() {
    if (map) {
      for (const k of iterateLenGet(map.keys())) {
        yield [k, map.get(k)];
      }
    }
  })());
}

export function zipGenerators<A,B>(iterA: Iterable<A>, iterB: Iterable<B>): ExtendedIterable<[A,B]> {
  return ExtendedIterable.from<[A,B]>((function*() {
    // $FlowIgnore
    const as = iterA[Symbol.iterator]();
    // $FlowIgnore
    const bs = iterB[Symbol.iterator]();
    while (true) {
      const nextA = as.next();
      const nextB = bs.next();
      if (nextA.done || nextB.done) {
        break;
      }
      yield [nextA.value, nextB.value];
    }
  })());
}

// $FlowIgnore
export class ExtendedIterable<T> implements Iterable<T> {

  __source: Iterable<T>;

  constructor(source: Iterable<T>) {
    this.__source = source;
  }

  static from<X>(col: Iterable<X>): ExtendedIterable<X> {
    return new ExtendedIterable<X>(col);
  }

  // $FlowIgnore
  [Symbol.iterator]()
    : Iterator<T> {
    return this.__source[Symbol.iterator]();
  }

  forEach(f: T => void): void {
    for (const t of this.__source) {
      f(t);
    }
  }

  zip<B>(iterB: Iterable<B>): ExtendedIterable<[T,B]> {
    return zipGenerators<T,B>(this.__source, iterB);
  }

  join(iterB: Iterable<T>): ExtendedIterable<T> {
    const source = this.__source;
    return ExtendedIterable.from<T>((function*(){
      for (const t of source) yield t;
      for (const t of iterB) yield t;
    })());
  }

  toArray(): Array<T> {
    return Array.from(this.__source);
  }

  toSet(): Set<T> {
    return new Set<T>(this.__source);
  }

  map<R>(f: T => R): ExtendedIterable<R> {
    const source = this.__source;
    return ExtendedIterable.from<R>((function*(){
      for (const t of source) {
        yield f(t);
      }
    })());
  }

  flatMap<R>(f: T => Iterable<R>): ExtendedIterable<R> {
    const source = this.__source;
    return ExtendedIterable.from<R>((function*(){
      for (const t of source) {
        for (const r of f(t)) {
          yield r;
        }
      }
    })());
  }

  filter(f: T => boolean): ExtendedIterable<T> {
    const source = this.__source;
    return ExtendedIterable.from<T>((function*(){
      for (const t of source) {
        if (f(t)) {
          yield t;
        }
      }
    })());
  }

  unique(): ExtendedIterable<T> {
    const set = new Set<T>();
    return this.filter(t => {
      if (set.has(t)) return false;
      set.add(t);
      return true;
    });
  }

  nonNull(): ExtendedIterable<$NonMaybeType<T>> {
    return this.filter(t => t != null);
  }
}

export class ExtendedIterableMap<K,V> extends ExtendedIterable<[K,V]> {

  static fromTuples<X,Y>(col: Iterable<[X,Y]>): ExtendedIterableMap<X,Y> {
    return new ExtendedIterableMap<X, Y>(col);
  }

  keys(): ExtendedIterable<K> {
    return this.map(([k]) => k);
  }

  values(): ExtendedIterable<V> {
    return this.map(([,v]) => v);
  }

  nonNullValue(): ExtendedIterableMap<K,$NonMaybeType<V>> {
    return ExtendedIterableMap.fromTuples(this.filter(([,v]) => v != null));
  }
}
