// @flow

import crypto from 'crypto';

export function getInitialSeeds() {
  return {
    AddressSeed: crypto.randomBytes(4).readUInt32BE(0),
    TransactionSeed: crypto.randomBytes(4).readUInt32BE(0),
    BlockSeed: crypto.randomBytes(4).readUInt32BE(0),
  };
}
