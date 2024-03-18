// @flow

// Handle restoring wallets that follow the bip44

import {
  discoverAllAddressesFrom,
} from './bip44AddressScan';
import type {
  GenerateAddressFunc,
} from './bip44AddressScan';
import type { ConfigType } from '../../../../../config/config-types';

import {
  ChainDerivations, BIP44_SCAN_SIZE,
} from '../../../../config/numbersConfig';

import type {
  TreeInsert, InsertRequest,
} from '../../../ada/lib/storage/database/walletTypes/common/utils.types';
import type { AddByHashFunc, } from '../storage/bridge/hashMapper';
import type { NetworkRow, CanonicalAddressInsert } from '../../../ada/lib/storage/database/primitives/tables';
import type { CoreAddressT } from '../../../ada/lib/storage/database/primitives/enums';
import type { Bip44ChainInsert } from '../../../ada/lib/storage/database/walletTypes/common/tables';
import type { FilterFunc } from '../../../ada/lib/state-fetch/types';

// populated by ConfigWebpackPlugin
declare var CONFIG: ConfigType;
const addressRequestSize = CONFIG.app.addressRequestSize;

// <TODO:PENDING_REMOVAL> bip44

export async function addAddrForType(
  addByHash: AddByHashFunc,
  insertRequest: InsertRequest,
  address: string,
  type: CoreAddressT,
): Promise<{|
  KeyDerivationId: number,
|}> {
  await addByHash({
    ...insertRequest,
    address: {
      type,
      data: address,
    },
  });
  return {
    KeyDerivationId: insertRequest.keyDerivationId,
  };
}

export async function scanBip44Chain(request: {|
  generateAddressFunc: GenerateAddressFunc,
  lastUsedIndex: number,
  checkAddressesInUse: FilterFunc,
  network: $ReadOnly<NetworkRow>,
  addByHash: AddByHashFunc,
  type: CoreAddressT,
|}): Promise<TreeInsert<CanonicalAddressInsert>> {
  const addresses = await discoverAllAddressesFrom(
    request.generateAddressFunc,
    request.lastUsedIndex,
    BIP44_SCAN_SIZE,
    addressRequestSize,
    request.checkAddressesInUse,
    request.network,
  );

  return addresses
    .map(({ address }, i) => {
      return {
        index: i + request.lastUsedIndex + 1,
        insert: async insertRequest => {
          return await addAddrForType(
            request.addByHash,
            insertRequest,
            address,
            request.type,
          );
        },
      };
    });
}

// <TODO:PENDING_REMOVAL> bip44
export async function scanBip44Account(request: {|
  generateInternalAddresses: GenerateAddressFunc,
  generateExternalAddresses: GenerateAddressFunc,
  lastUsedInternal: number,
  lastUsedExternal: number,
  checkAddressesInUse: FilterFunc,
  network: $ReadOnly<NetworkRow>,
  addByHash: AddByHashFunc,
  type: CoreAddressT,
|}): Promise<TreeInsert<Bip44ChainInsert>> {
  const externalAddresses = await scanBip44Chain({
    generateAddressFunc: request.generateInternalAddresses,
    lastUsedIndex: request.lastUsedExternal,
    checkAddressesInUse: request.checkAddressesInUse,
    network: request.network,
    addByHash: request.addByHash,
    type: request.type,
  });
  const internalAddresses = await scanBip44Chain({
    generateAddressFunc: request.generateExternalAddresses,
    lastUsedIndex: request.lastUsedInternal,
    checkAddressesInUse: request.checkAddressesInUse,
    network: request.network,
    addByHash: request.addByHash,
    type: request.type,
  });

  return [
    {
      index: ChainDerivations.EXTERNAL,
      // initial value. Doesn't override existing entry
      insert: insertRequest => Promise.resolve({
        KeyDerivationId: insertRequest.keyDerivationId,
        DisplayCutoff: 0,
      }),
      children: externalAddresses,
    },
    {
      index: ChainDerivations.INTERNAL,
      insert: insertRequest => Promise.resolve({
        KeyDerivationId: insertRequest.keyDerivationId,
        DisplayCutoff: null,
      }),
      children: internalAddresses,
    }
  ];
}
