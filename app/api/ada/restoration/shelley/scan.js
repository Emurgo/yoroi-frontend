// @flow

// Handle restoring wallets that follow cip1852

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
import environment from '../../../../environment';

import { RustModule } from '../../lib/cardanoCrypto/rustLoader';

import type {
  TreeInsert, InsertRequest,
} from '../../lib/storage/database/walletTypes/common/utils';
import type { AddByHashFunc, } from '../../lib/storage/bridge/hashMapper';
import type { AddressDiscriminationType } from 'js-chain-libs';
import type { CanonicalAddressInsert } from '../../lib/storage/database/primitives/tables';
import { CoreAddressTypes } from '../../lib/storage/database/primitives/enums';
import type { Bip44ChainInsert } from '../../lib/storage/database/walletTypes/common/tables';

declare var CONFIG: ConfigType;
const addressRequestSize = CONFIG.app.addressRequestSize;

export function v3genAddressBatchFunc(
  addressChain: RustModule.WalletV3.Bip32PublicKey,
  discrimination: AddressDiscriminationType,
): GenerateAddressFunc {
  return (
    indices: Array<number>
  ) => {
    return indices.map(i => {
      const addressKey = addressChain.derive(i).to_raw_key();
      const address = RustModule.WalletV3.Address.single_from_public_key(
        addressKey,
        discrimination
      );
      const asHex = Buffer.from(address.as_bytes()).toString('hex');
      return asHex;
    });
  };
}

export async function addShelleyAddress(
  addByHash: AddByHashFunc,
  insertRequest: InsertRequest,
  address: string,
): Promise<{|
  KeyDerivationId: number,
|}> {
  await addByHash({
    ...insertRequest,
    address: {
      // TODO: add group + shelley single
      type: CoreAddressTypes.CARDANO_LEGACY,
      data: address,
    },
  });
  return {
    KeyDerivationId: insertRequest.keyDerivationId,
  };
}

export async function scanChain(request: {|
  generateAddressFunc: GenerateAddressFunc,
  lastUsedIndex: number,
  checkAddressesInUse: FilterFunc,
  // stakingKey: RustModule.WalletV3.AccountAddress,
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
          return await addShelleyAddress(
            request.addByHash,
            insertRequest,
            address
          );
        },
      };
    });
}

export async function scanAccountByVersion(request: {
  accountPublicKey: string,
  lastUsedInternal: number,
  lastUsedExternal: number,
  checkAddressesInUse: FilterFunc,
  addByHash: AddByHashFunc,
  protocolMagic: number,
}): Promise<TreeInsert<Bip44ChainInsert>> {
  const genAddressBatchFunc = v3genAddressBatchFunc;

  const key = RustModule.WalletV3.Bip32PublicKey.from_bytes(
    Buffer.from(request.accountPublicKey, 'hex'),
  );
  const discrimination = environment.isMainnet()
    ? RustModule.WalletV3.AddressDiscrimination.Production
    : RustModule.WalletV3.AddressDiscrimination.Test;

  const insert = await scanAccount({
    generateInternalAddresses: genAddressBatchFunc(
      key.derive(INTERNAL),
      discrimination,
    ),
    generateExternalAddresses: genAddressBatchFunc(
      key.derive(EXTERNAL),
      discrimination,
    ),
    lastUsedInternal: request.lastUsedInternal,
    lastUsedExternal: request.lastUsedExternal,
    checkAddressesInUse: request.checkAddressesInUse,
    addByHash: request.addByHash,
    protocolMagic: request.protocolMagic,
  });
  return insert;
}
export async function scanAccount(request: {|
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
