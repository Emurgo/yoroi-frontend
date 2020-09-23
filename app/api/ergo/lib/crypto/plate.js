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
import { Address, } from '@coinbarn/ergo-ts';

export const generateErgoPlate = (
  rootPk: BIP32PrivateKey,
  accountIndex: number,
  count: number,
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
  );
  const generateAddressFunc = (indices: Array<number>) => (
    baseAddressGen(indices)
      .map(addrBytes => Address.fromBytes(
        Buffer.from(addrBytes, 'hex')
      ))
      .map(addr => addr.address)
  );
  const addresses = generateAddressFunc([...Array(count).keys()]);
  return { addresses, plate };
};
