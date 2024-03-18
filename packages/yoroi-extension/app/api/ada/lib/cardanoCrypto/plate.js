// @flow

import { RustModule } from './rustLoader';
import type { GenerateAddressFunc } from '../../../common/lib/restoration/bip44AddressScan';
import {
  ChainDerivations,
  CoinTypes,
  HARD_DERIVATION_START,
  STAKING_KEY_INDEX,
  WalletTypePurpose,
} from '../../../../config/numbersConfig';
import type { WalletChecksum } from '@emurgo/cip4-js';
import { walletChecksum } from '@emurgo/cip4-js';

export type PlateResponse = {|
  addresses: Array<string>,
  plate: WalletChecksum
|};

export const generateShelleyPlate = (
  rootPk: RustModule.WalletV4.Bip32PrivateKey,
  accountIndex: number,
  count: number,
  chainNetworkId: number,
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

  const plate = walletChecksum(
    Buffer.from(accountPublic.as_bytes()).toString('hex')
  );
  const generateAddressFunc = genBaseAddressBatchFunc(
    chainKey,
    stakingKey,
    chainNetworkId,
  );
  const addresses = generateAddressFunc([...Array(count).keys()]);
  return { addresses, plate };
};

export function genBaseAddressBatchFunc(
  addressChain: RustModule.WalletV4.Bip32PublicKey,
  stakingKey: RustModule.WalletV4.PublicKey,
  chainNetworkId: number,
): GenerateAddressFunc {
  return (
    indices: Array<number>
  ) => {
    const stakeKey = RustModule.WalletV4.Credential.from_keyhash(stakingKey.hash());
    return indices.map(i => {
      const addressKey = addressChain.derive(i).to_raw_key();
      const paymentKey = RustModule.WalletV4.Credential.from_keyhash(addressKey.hash());
      const address = RustModule.WalletV4.BaseAddress.new(
        chainNetworkId,
        paymentKey,
        stakeKey
      );
      return address.to_address().to_bech32();
    });
  };
}
