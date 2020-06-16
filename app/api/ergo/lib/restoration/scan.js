// @flow

// Handle restoring wallets for Ergo

import type {
  GenerateAddressFunc,
} from '../../../common/lib/restoration/bip44AddressScan';
import type {
  InsertRequest,
} from '../../../ada/lib/storage/database/walletTypes/common/utils';
import type { AddByHashFunc, } from '../../../common/lib/storage/bridge/hashMapper';
import { CoreAddressTypes } from '../../../ada/lib/storage/database/primitives/enums';
import { Address, } from '@coinbarn/ergo-ts';
import type { BIP32Interface } from 'bip32';


export function ergoGenAddressBatchFunc(
  chain: BIP32Interface,
): GenerateAddressFunc {
  return (
    indices: Array<number>
  ) => {
    return indices.map(i => {
      const bip32Addr = chain.derive(i);
      const addr = Address.fromPk(bip32Addr.publicKey.toString('hex'));
      return addr.address;
    });
  };
}

export async function addErgoP2PK(
  addByHash: AddByHashFunc,
  insertRequest: InsertRequest,
  address: string,
): Promise<{|
  KeyDerivationId: number,
|}> {
  await addByHash({
    ...insertRequest,
    address: {
      type: CoreAddressTypes.ERGO_P2PK,
      data: address,
    },
  });
  return {
    KeyDerivationId: insertRequest.keyDerivationId,
  };
}
