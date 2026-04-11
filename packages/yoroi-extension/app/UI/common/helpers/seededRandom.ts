/**
 * Map a numeric seed (e.g. `Math.random()`) to a 32-bit value without float precision loss.
 */
function seedToUint32(seed: number): number {
  const buffer = new ArrayBuffer(8);
  new Float64Array(buffer)[0] = seed;
  const u = new Uint32Array(buffer);
  return (u[0]! ^ u[1]!) >>> 0;
}

/**
 * Mulberry32: fast deterministic PRNG; returns values in [0, 1).
 */
function mulberry32(initial: number) {
  let a = initial >>> 0;
  if (a === 0) {
    a = 0x6d2b79f5;
  }
  return () => {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Deterministic PRNG in [0, 1) from a numeric seed (e.g. output of `Math.random()`).
 * Same seed yields the same sequence of values.
 */
export function createSeededRandom(seed: number): () => number {
  return mulberry32(seedToUint32(seed));
}
