// @flow

// Handle restoring wallets that follow the bip44

import {
  discoverAllAddressesFrom,
} from './bip44AddressScan';
import type {
  GenerateAddressFunc,
} from './bip44AddressScan';
import type { ConfigType } from '../../../../../config/config-types';
import type { FilterFunc } from '../state-fetch/currencySpecificTypes';

import {
  ChainDerivations, BIP44_SCAN_SIZE,
} from '../../../../config/numbersConfig';

import type {
  TreeInsert, InsertRequest,
} from '../../../ada/lib/storage/database/walletTypes/common/utils';
import type { AddByHashFunc, } from '../storage/bridge/hashMapper';
import type { CanonicalAddressInsert } from '../../../ada/lib/storage/database/primitives/tables';
import type { CoreAddressT } from '../../../ada/lib/storage/database/primitives/enums';
import type { Bip44ChainInsert } from '../../../ada/lib/storage/database/walletTypes/common/tables';

declare var CONFIG: ConfigType;
const addressRequestSize = CONFIG.app.addressRequestSize;

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

async function scanChain(request: {|
  generateAddressFunc: GenerateAddressFunc,
  lastUsedIndex: number,
  checkAddressesInUse: FilterFunc,
  addByHash: AddByHashFunc,
  type: CoreAddressT,
|}): Promise<TreeInsert<CanonicalAddressInsert>> {
  const addresses = await discoverAllAddressesFrom(
    request.generateAddressFunc,
    request.lastUsedIndex,
    BIP44_SCAN_SIZE,
    addressRequestSize,
    request.checkAddressesInUse,
  );

  return addresses
    .map((address, i) => {
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

export async function scanBip44Account(request: {|
  generateInternalAddresses: GenerateAddressFunc,
  generateExternalAddresses: GenerateAddressFunc,
  lastUsedInternal: number,
  lastUsedExternal: number,
  checkAddressesInUse: FilterFunc,
  addByHash: AddByHashFunc,
  type: CoreAddressT,
|}): Promise<TreeInsert<Bip44ChainInsert>> {
  const externalAddresses = await scanChain({
    generateAddressFunc: request.generateInternalAddresses,
    lastUsedIndex: request.lastUsedExternal,
    checkAddressesInUse: request.checkAddressesInUse,
    addByHash: request.addByHash,
    type: request.type,
  });
  const internalAddresses = await scanChain({
    generateAddressFunc: request.generateExternalAddresses,
    lastUsedIndex: request.lastUsedInternal,
    checkAddressesInUse: request.checkAddressesInUse,
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
