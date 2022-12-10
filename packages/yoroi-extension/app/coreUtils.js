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
  // $FlowFixMe[incompatible-return]
  return url?.replace('ipfs://', 'https://ipfs.io/ipfs/');
}

export function last<T>(arr: Array<T>): T | void {
  return arr.length > 0 ? arr[arr.length - 1] : undefined;
}

export function isNonEmptyString(str: ?string): boolean {
  return (str?.length ?? 0) > 0;
}

export function isEmptyOrNullString(str: ?string): boolean {
  return isNonEmptyString(str) === false;
}

export function emptyStringToNull(str: ?string): ?string {
  return isNonEmptyString(str) ? str : null;
}