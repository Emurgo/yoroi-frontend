// @flow

import { ergoGenAddressBatchFunc } from '../restoration/scan';
import { BIP32PrivateKey, derivePath } from '../../../common/lib/crypto/keys/keyRepository';
import {
  HARD_DERIVATION_START,
  CoinTypes,
  WalletTypePurpose,
  ChainDerivations,
} from '../../../../config/numbersConfig';
import { walletChecksum, } from '@emurgo/cip4-js';
import type { PlateResponse } from '../../../common/lib/crypto/plate';
import { RustModule } from '../../../ada/lib/cardanoCrypto/rustLoader';

export const generateErgoPlate = (
  rootPk: BIP32PrivateKey,
  accountIndex: number,
  count: number,
  chainNetworkId: $Values<typeof RustModule.SigmaRust.NetworkPrefix>,
): PlateResponse => {
  const chainKey = derivePath(
    rootPk,
    [
      WalletTypePurpose.BIP44,
      CoinTypes.ERGO,
      accountIndex + HARD_DERIVATION_START,
      ChainDerivations.EXTERNAL,
    ]
  ).toPublic();

  const plate = walletChecksum(
    chainKey.toBuffer().toString('hex')
  );

  const baseAddressGen = ergoGenAddressBatchFunc(
    chainKey.key,
    chainNetworkId,
  );
  const generateAddressFunc = (indices: Array<number>) => (
    baseAddressGen(indices)
      .map(addrBytes => RustModule.SigmaRust.NetworkAddress.from_bytes(
        Buffer.from(addrBytes, 'hex')
      ))
      .map(addr => addr.to_base58())
  );
  const addresses = generateAddressFunc([...Array(count).keys()]);
  return { addresses, plate };
};
