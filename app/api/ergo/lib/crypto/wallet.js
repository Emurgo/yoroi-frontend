// @flow

import { mnemonicToSeedSync } from 'bip39';
import { fromSeed, } from 'bip32';

export function generateWalletRootKey(
  mnemonic: string
): string {
  const seed = mnemonicToSeedSync(mnemonic);
  const sk = fromSeed(seed);
  return sk.toBase58();
}
