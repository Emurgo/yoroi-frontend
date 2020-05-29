// @flow

// Handle restoring wallets that follow the v2 addressing scheme (bip44)

import type {
  GenerateAddressFunc,
} from '../../../common/lib/restoration/bip44AddressScan';
import type { ConfigType } from '../../../../../config/config-types';

import { RustModule } from '../../lib/cardanoCrypto/rustLoader';

import type {
  InsertRequest,
} from '../../lib/storage/database/walletTypes/common/utils';
import type { AddByHashFunc, } from '../../../common/lib/storage/bridge/hashMapper';
import { CoreAddressTypes } from '../../lib/storage/database/primitives/enums';

declare var CONFIG: ConfigType;
/**
 * Note: we purpose hardcode this in the Bip44 case
 * because for Cardano we want to use the legacy Cardano protocol magic
 * to be able to generate the right legacy addresses
 * instead of the actual protocol magic the network is using (which is a block hash for Shelley
 */
const protocolMagic = CONFIG.network.protocolMagic;

export function v2genAddressBatchFunc(
  addressChain: RustModule.WalletV2.Bip44ChainPublic,
): GenerateAddressFunc {
  const settings = RustModule.WalletV2.BlockchainSettings.from_json({
    protocol_magic: protocolMagic
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
