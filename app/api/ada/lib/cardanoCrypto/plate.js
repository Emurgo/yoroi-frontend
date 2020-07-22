// @flow

import { RustModule } from './rustLoader';
import { v2genAddressBatchFunc } from '../../restoration/byron/scan';
import {
  HARD_DERIVATION_START,
  CoinTypes,
  WalletTypePurpose,
  ChainDerivations,
} from '../../../../config/numbersConfig';
import { legacyWalletChecksum } from '@emurgo/cip4-js';
import type { PlateResponse } from '../../../common/lib/crypto/plate';

export const generateByronPlate = (
  rootPk: RustModule.WalletV4.Bip32PrivateKey,
  accountIndex: number,
  count: number,
): PlateResponse => {
  const accountKey = rootPk
    .derive(WalletTypePurpose.BIP44)
    .derive(CoinTypes.CARDANO)
    .derive(accountIndex + HARD_DERIVATION_START);
  const accountPublic = accountKey.to_public();
  const chainKey = accountPublic.derive(ChainDerivations.EXTERNAL);

  const accountPlate = legacyWalletChecksum(
    Buffer.from(accountPublic.as_bytes()).toString('hex')
  );
  const generateAddressFunc = v2genAddressBatchFunc(
    RustModule.WalletV2.Bip44ChainPublic.new(
      RustModule.WalletV2.PublicKey.from_hex(
        Buffer.from(chainKey.as_bytes()).toString('hex')
      ),
      RustModule.WalletV2.DerivationScheme.v2()
    ),
  );
  const addresses = generateAddressFunc([...Array(count).keys()]);
  return { addresses, accountPlate };
};
