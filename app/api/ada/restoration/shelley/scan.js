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
  TreeInsert,
} from '../../lib/storage/database/walletTypes/common/utils';
import type { HashToIdsFunc, } from '../../lib/storage/models/utils';
import type { AddressDiscriminationType } from 'js-chain-libs';
import type { CanonicalAddressMeta } from '../../lib/storage/database/primitives/tables';
import type { Bip44ChainMeta } from '../../lib/storage/database/walletTypes/common/tables';

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


export async function scanChain(request: {|
  generateAddressFunc: GenerateAddressFunc,
  lastUsedIndex: number,
  checkAddressesInUse: FilterFunc,
  stakingKey: RustModule.WalletV3.AccountAddress,
  hashToIds: HashToIdsFunc,
|}): Promise<TreeInsert<CanonicalAddressMeta>> {
  const addresses = await discoverAllAddressesFrom(
    request.generateAddressFunc,
    request.lastUsedIndex,
    BIP44_SCAN_SIZE,
    addressRequestSize,
    request.checkAddressesInUse,
  );

  // TODO: Add group keys also
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
}): Promise<TreeInsert<Bip44ChainMeta>> {
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
|}): Promise<TreeInsert<Bip44ChainMeta>> {
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
      index: EXTERNAL,
      // initial value. Doesn't override existing entry
      insert: { DisplayCutoff: 0 },
      children: externalAddresses,
    },
    {
      index: INTERNAL,
      insert: { DisplayCutoff: null },
      children: internalAddresses,
    }
  ];
}
