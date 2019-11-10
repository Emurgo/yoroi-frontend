// @flow

// Handle restoring wallets that follow the v2 addressing scheme (bip44)

import {
  discoverAllAddressesFrom,
} from '../../lib/adaAddressProcessing';
import type {
  GenerateAddressFunc,
} from '../../lib/adaAddressProcessing';
import type { ConfigType } from '../../../../../config/config-types';
import type { FilterFunc } from '../../lib/state-fetch/types';

import {
  INTERNAL, EXTERNAL, BIP44_SCAN_SIZE,
} from '../../../../config/numbersConfig';

import { RustModule } from '../../lib/cardanoCrypto/rustLoader';

import type {
  TreeInsert, InsertRequest,
} from '../../lib/storage/database/walletTypes/common/utils';
import type { AddByHashFunc, } from '../../lib/storage/bridge/hashMapper';
import type { CanonicalAddressInsert } from '../../lib/storage/database/primitives/tables';
import { CoreAddressTypes } from '../../lib/storage/database/primitives/enums';
import type { Bip44ChainInsert } from '../../lib/storage/database/walletTypes/common/tables';

declare var CONFIG: ConfigType;
const addressRequestSize = CONFIG.app.addressRequestSize;

export function v2genAddressBatchFunc(
  addressChain: RustModule.WalletV2.Bip44ChainPublic,
  protocolMagic: number,
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
      return addr.to_base58();
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

async function scanChain(request: {|
  generateAddressFunc: GenerateAddressFunc,
  lastUsedIndex: number,
  checkAddressesInUse: FilterFunc,
  addByHash: AddByHashFunc,
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
          return await addByronAddress(
            request.addByHash,
            insertRequest,
            address
          );
        },
      };
    });
}

export async function scanBip44Account(request: {
  accountPublicKey: string,
  lastUsedInternal: number,
  lastUsedExternal: number,
  checkAddressesInUse: FilterFunc,
  addByHash: AddByHashFunc,
  protocolMagic: number,
}): Promise<TreeInsert<Bip44ChainInsert>> {
  const genAddressBatchFunc = v2genAddressBatchFunc;

  const key = RustModule.WalletV2.Bip44AccountPublic.new(
    RustModule.WalletV2.PublicKey.from_hex(request.accountPublicKey),
    RustModule.WalletV2.DerivationScheme.v2()
  );
  const insert = await scanAccount({
    generateInternalAddresses: genAddressBatchFunc(
      key.bip44_chain(false),
      request.protocolMagic,
    ),
    generateExternalAddresses: genAddressBatchFunc(
      key.bip44_chain(true),
      request.protocolMagic,
    ),
    lastUsedInternal: request.lastUsedInternal,
    lastUsedExternal: request.lastUsedExternal,
    checkAddressesInUse: request.checkAddressesInUse,
    addByHash: request.addByHash,
    protocolMagic: request.protocolMagic,
  });
  return insert;
}
async function scanAccount(request: {|
  generateInternalAddresses: GenerateAddressFunc,
  generateExternalAddresses: GenerateAddressFunc,
  lastUsedInternal: number,
  lastUsedExternal: number,
  checkAddressesInUse: FilterFunc,
  addByHash: AddByHashFunc,
  protocolMagic: number,
|}): Promise<TreeInsert<Bip44ChainInsert>> {
  const externalAddresses = await scanChain({
    generateAddressFunc: request.generateInternalAddresses,
    lastUsedIndex: request.lastUsedExternal,
    checkAddressesInUse: request.checkAddressesInUse,
    addByHash: request.addByHash,
  });
  const internalAddresses = await scanChain({
    generateAddressFunc: request.generateExternalAddresses,
    lastUsedIndex: request.lastUsedInternal,
    checkAddressesInUse: request.checkAddressesInUse,
    addByHash: request.addByHash,
  });

  return [
    {
      index: EXTERNAL,
      // initial value. Doesn't override existing entry
      insert: insertRequest => Promise.resolve({
        KeyDerivationId: insertRequest.keyDerivationId,
        DisplayCutoff: 0,
      }),
      children: externalAddresses,
    },
    {
      index: INTERNAL,
      insert: insertRequest => Promise.resolve({
        KeyDerivationId: insertRequest.keyDerivationId,
        DisplayCutoff: null,
      }),
      children: internalAddresses,
    }
  ];
}
