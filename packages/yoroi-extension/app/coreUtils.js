// @flow

export function bytesToHex(bytes: *): string {
  return Buffer.from(bytes).toString('hex');
}

export function hexToBytes(hex: string): Buffer {
  return Buffer.from(hex, 'hex');
}

export function hexToUtf(hex: string): string {
  return hexToBytes(hex).toString('utf-8');
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
export function urlResolveIpfs<T: ?string>(url: T): T {
  // $FlowFixMe
  return url?.replace('ipfs://', 'https://ipfs.io/ipfs/');
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
