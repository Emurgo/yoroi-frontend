// @flow

// Handle restoring wallets that follow the v2 addressing scheme (bip44)

import {
  discoverAllAddressesFrom,
} from './lib/adaAddressProcessing';
import type {
  GenerateAddressFunc,
} from './lib/adaAddressProcessing';
import type { ConfigType } from '../../../config/config-types';
import type { FilterFunc } from './lib/state-fetch/types';

import {
  BIP44_SCAN_SIZE,
} from '../../config/numbersConfig';

import { RustModule } from './lib/cardanoCrypto/rustLoader';

import type {
  TreeInsert,
} from './lib/storage/database/walletTypes/common/utils';
import type { HashToIdsFunc, } from './lib/storage/models/utils';

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

export function v3genAddressBatchFunc(
  addressChain: RustModule.WalletV3.Bip32PublicKey,
): GenerateAddressFunc {
  return (
    indices: Array<number>
  ) => {
    return indices.map(i => {
      const addressKey = addressChain.derive(i).to_raw_key();
      // recall: no canonical string representation of an address in Rust
      // so instead we send the payment key
      const asHex = Buffer.from(addressKey.as_bytes()).toString('hex');
      return asHex;
    });
  };
}


export async function scanChain(request: {|
  generateAddressFunc: GenerateAddressFunc,
  lastUsedIndex: number,
  checkAddressesInUse: FilterFunc,
  hashToIds: HashToIdsFunc,
|}): Promise<TreeInsert<{ AddressId: number }>> {
  // TODO: this is made for v2 addresses. We can avoid this entirely for v3
  const addresses = await discoverAllAddressesFrom(
    request.generateAddressFunc,
    request.lastUsedIndex,
    BIP44_SCAN_SIZE,
    addressRequestSize,
    request.checkAddressesInUse,
  );

  const idMapping = await request.hashToIds(addresses);
  return addresses
    .map((address, i) => {
      const id = idMapping.get(address);
      if (id == null) throw new Error('scanChain should never happen');
      return {
        index: i + request.lastUsedIndex + 1,
        insert: { AddressId: id },
      };
    });
}

export async function scanAccountByVersion(request: {
  accountPublicKey: string,
  lastUsedInternal: number,
  lastUsedExternal: number,
  checkAddressesInUse: FilterFunc,
  hashToIds: HashToIdsFunc,
  protocolMagic: number,
}): Promise<TreeInsert<{ DisplayCutoff: null | number }>> {
  // TODO: needs to change depending on v2/v3
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
    hashToIds: request.hashToIds,
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
  hashToIds: HashToIdsFunc,
  protocolMagic: number,
|}): Promise<TreeInsert<{ DisplayCutoff: null | number }>> {
  const externalAddresses = await scanChain({
    generateAddressFunc: request.generateInternalAddresses,
    lastUsedIndex: request.lastUsedExternal,
    checkAddressesInUse: request.checkAddressesInUse,
    hashToIds: request.hashToIds,
  });
  const internalAddresses = await scanChain({
    generateAddressFunc: request.generateExternalAddresses,
    lastUsedIndex: request.lastUsedInternal,
    checkAddressesInUse: request.checkAddressesInUse,
    hashToIds: request.hashToIds,
  });

  return [
    {
      index: 0, // external chain,
      insert: { DisplayCutoff: 0 },
      children: externalAddresses,
    },
    {
      index: 1, // internal chain,
      insert: { DisplayCutoff: null },
      children: internalAddresses,
    }
  ];
}
