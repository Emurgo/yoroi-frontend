// @flow

import { mnemonicToSeedSync } from 'bip39';
import { fromSeed, } from 'bip32';
import { BIP32PrivateKey } from '../../../common/lib/crypto/keys/keyRepository';

export function generateWalletRootKey(
  mnemonic: string
): BIP32PrivateKey {
  const seed = mnemonicToSeedSync(mnemonic);
  return BIP32PrivateKey.fromBip32(fromSeed(seed));
}
