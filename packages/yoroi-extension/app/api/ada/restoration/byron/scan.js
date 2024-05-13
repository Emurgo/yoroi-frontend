// @flow

// Handle restoring wallets that follow the v2 addressing scheme (bip44)

import type {
  GenerateAddressFunc,
} from '../../../common/lib/restoration/bip44AddressScan';

import { RustModule } from '../../lib/cardanoCrypto/rustLoader';

import type {
  InsertRequest,
} from '../../lib/storage/database/walletTypes/common/utils.types';
import type { AddByHashFunc, } from '../../../common/lib/storage/bridge/hashMapper';
import { CoreAddressTypes } from '../../lib/storage/database/primitives/enums';

export function v2genAddressBatchFunc(
  addressChain: RustModule.WalletV2.Bip44ChainPublic,
  byronProtocolMagic: number,
): GenerateAddressFunc {
  const settings = RustModule.WalletV2.BlockchainSettings.from_json({
    protocol_magic: byronProtocolMagic
  });
  return (
    indices: Array<number>
  ) => {
    return indices.map(i => {
      const pubKey = addressChain.address_key(
        RustModule.WalletV2.AddressKeyIndex.new(i)
      );
      const addr = pubKey.bootstrap_era_address(settings);
      const hex = addr.to_base58();
      return hex;
    });
  };
}

export async function addByronAddress(
  addByHash: AddByHashFunc,
  insertRequest: InsertRequest,
  address: string,
): Promise<{|
  KeyDerivationId: number,
|}> {
  await addByHash({
    ...insertRequest,
    address: {
      type: CoreAddressTypes.CARDANO_LEGACY,
      data: address,
    },
  });
  return {
    KeyDerivationId: insertRequest.keyDerivationId,
  };
}
