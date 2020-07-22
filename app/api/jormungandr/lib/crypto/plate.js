// @flow

import { RustModule } from '../../../ada/lib/cardanoCrypto/rustLoader';
import type { GenerateAddressFunc } from '../../../common/lib/restoration/bip44AddressScan';
import { Bech32Prefix } from '../../../../config/stringConfig';
import {
  HARD_DERIVATION_START,
  CoinTypes,
  WalletTypePurpose,
  ChainDerivations,
  STAKING_KEY_INDEX,
} from '../../../../config/numbersConfig';
import type { AddressDiscriminationType } from '@emurgo/js-chain-libs/js_chain_libs';
import { legacyWalletChecksum } from '@emurgo/cip4-js';
import type { PlateResponse } from '../../../common/lib/crypto/plate';

export const generateJormungandrPlate = (
  rootPk: RustModule.WalletV3.Bip32PrivateKey,
  accountIndex: number,
  count: number,
  discrimination: AddressDiscriminationType,
): PlateResponse => {
  const accountKey = rootPk
    .derive(WalletTypePurpose.CIP1852)
    .derive(CoinTypes.CARDANO)
    .derive(accountIndex + HARD_DERIVATION_START);
  const accountPublic = accountKey.to_public();
  const chainKey = accountPublic.derive(ChainDerivations.EXTERNAL);

  const stakingKey = accountPublic
    .derive(ChainDerivations.CHIMERIC_ACCOUNT)
    .derive(STAKING_KEY_INDEX)
    .to_raw_key();

  const accountPlate = legacyWalletChecksum(
    Buffer.from(accountPublic.as_bytes()).toString('hex')
  );
  const generateAddressFunc = genGroupAddressBatchFunc(
    chainKey,
    stakingKey,
    discrimination,
  );
  const addresses = generateAddressFunc([...Array(count).keys()]);
  return { addresses, accountPlate };
};

export function genGroupAddressBatchFunc(
  addressChain: RustModule.WalletV3.Bip32PublicKey,
  stakingKey: RustModule.WalletV3.PublicKey,
  discrimination: AddressDiscriminationType,
): GenerateAddressFunc {
  return (
    indices: Array<number>
  ) => {
    return indices.map(i => {
      const addressKey = addressChain.derive(i).to_raw_key();
      const address = RustModule.WalletV3.Address.delegation_from_public_key(
        addressKey,
        stakingKey,
        discrimination
      );
      return address.to_string(Bech32Prefix.ADDRESS);
    });
  };
}
