// @flow

/**
 * We use Fnv32a as a hash for the following reasons
 * 1) Small enough that you can easily inline it and easily compare to reference implementation it
 * (compared to xxhash, murmur, etc. which are quite lengthy)
 * 2) It has a better distribution than naive hashing (ex: Java's hashing of strings
 * 3) For pure Javascript implementations, it's as fast as xxhash and murmur
 * See this post which shows Fnv32a does very well compared to alternatives
 * https://softwareengineering.stackexchange.com/a/145633
 */
function hashFnv32a(
  str: string,
  seed: number,
): number {
  let hval = (seed === undefined) ? 0x811c9dc5 : seed;

  for (let i = 0, l = str.length; i < l; i++) {
    hval ^= str.charCodeAt(i);
    hval += (hval << 1) + (hval << 4) + (hval << 7) + (hval << 8) + (hval << 24);
  }
  return hval >>> 0;
}

/** clears the n-th bit */
function clearBit(
  num: number,
  bit: number
): number {
  return num & ~(1 << bit);
}

/**
 * Benchmark info:
 * On my macbook pro I get ~4hashes/second for a v2 address
 * I get about 1 collision every 500,000 addresses (so collisions are rare but possible)
 */
export function digestForHash(
  str: string,
  seed: number,
): number {
  const buffer = new ArrayBuffer(8);
  const view = new DataView(buffer);

  // Since Javascript can't compute bitwise on 64bits ints
  // we instead extend the 32-bit hash algorithm to 64 bits
  // using Hash = H[H[x] || x]
  // rationale: any other way would mean collision in `h1` implies collision in h2
  const h1 = hashFnv32a(str, seed);
  const h2 = hashFnv32a(h1.toString(16) + str, seed);

  // we need to clear the 20th bit because IEEE 754 (Javascript numbers)
  // use the 20th bit as a flag for special values like infinity, NaN, etc.
  // by setting the 20th bit to 0, we always get a regular number
  const nonNan = clearBit(h1, 20);
  view.setInt32(0, nonNan);
  view.setInt32(4, h2);
  return view.getFloat64(0);
}
