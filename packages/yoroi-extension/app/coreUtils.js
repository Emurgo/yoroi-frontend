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

export function createFilterUniqueBy<T, K>(getter: T => K): T => boolean {
  const set = new Set();
  return t => {
    const k = getter(t);
    // false && <ignored> - when set already has entry
    // true && set.add - when doesn't have
    return !set.has(k) && set.add(k) && true;
  }
}
