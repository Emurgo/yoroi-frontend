// @flow

import {
  WalletTypePurpose,
} from '../../../../config/numbersConfig';
import {
  generateWalletRootKey,
} from '../crypto/wallet';
import { derivePath } from '../../../common/lib/crypto/keys/keyRepository';
import { Address } from '@coinbarn/ergo-ts';

export function getErgoAddress(
  mnemonic: string,
  path: Array<number>,
): string {
  const rootKey = generateWalletRootKey(mnemonic);
  const derivedKey = derivePath(rootKey, path);

  if (path[0] === WalletTypePurpose.BIP44) {
    return Address.fromPk(
      derivedKey.toPublic().key.publicKey.toString('hex')
    ).addrBytes.toString('hex');
  }
  throw new Error('Unexpected purpose');
}
