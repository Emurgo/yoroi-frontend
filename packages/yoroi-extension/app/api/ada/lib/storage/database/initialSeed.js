// @flow

import * as crypto from 'crypto';

export function getInitialSeeds(): {|
  AddressSeed: number,
  TransactionSeed: number,
  BlockSeed: number,
  TokenSeed: number,
  |} {
  return {
    AddressSeed: crypto.randomBytes(4).readUInt32BE(0),
    TransactionSeed: crypto.randomBytes(4).readUInt32BE(0),
    BlockSeed: crypto.randomBytes(4).readUInt32BE(0),
    TokenSeed: crypto.randomBytes(4).readUInt32BE(0),
  };
}
