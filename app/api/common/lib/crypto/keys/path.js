// @flow

const HARDENED = 0x80000000;

export const Precondition = {
  // Generic check
  check: (cond: boolean) => {
    if (!cond) throw new Error('Precondition failed');
  },
  // Basic types
  checkIsString: (data: any) => {
    Precondition.check(typeof data === 'string');
  },
  checkIsInteger: (data: any) => {
    Precondition.check(Number.isInteger(data));
  },
};

function safeParseInt(str: string): number {
  Precondition.checkIsString(str);
  const i = parseInt(str, 10);
  // Check that we parsed everything
  Precondition.check('' + i === str);
  // Could be invalid
  Precondition.check(!isNaN(i));
  // Could still be float
  Precondition.checkIsInteger(i);
  return i;
}


function parseBIP32Index(str: string): number {
  let base = 0;
  if (str.endsWith("'")) {
    str = str.slice(0, -1);
    base = HARDENED;
  }
  const i = safeParseInt(str);
  Precondition.check(i >= 0);
  Precondition.check(i < HARDENED);
  return base + i;
}

export function bip32StringToPath(data: string): Array<number> {
  Precondition.checkIsString(data);
  Precondition.check(data.length > 0);

  return data.split('/')
    .filter(entry => entry !== 'm')
    .map(parseBIP32Index);
}

export function toDerivationPathString(derivationPath: Array<number>): string {
  return `m/${derivationPath
    .map((item) => (item % HARDENED) + (item >= HARDENED ? "'" : ''))
    .join('/')}`;
}

