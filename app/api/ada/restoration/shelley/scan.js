// @flow

// Handle restoring wallets that follow cip1852

import {
  discoverAllAddressesFrom,
} from '../../../common/lib/restoration/bip44AddressScan';
import type {
  GenerateAddressFunc,
} from '../../../common/lib/restoration/bip44AddressScan';
import type { ConfigType } from '../../../../../config/config-types';
import type { FilterFunc } from '../../../common/lib/state-fetch/currencySpecificTypes';

import {
  ChainDerivations, BIP44_SCAN_SIZE,
} from '../../../../config/numbersConfig';
import environment from '../../../../environment';

import { RustModule } from '../../lib/cardanoCrypto/rustLoader';

import type {
  TreeInsert, InsertRequest,
} from '../../lib/storage/database/walletTypes/common/utils';
import type { AddByHashFunc, } from '../../../common/lib/storage/bridge/hashMapper';
import type { AddressDiscriminationType } from '@emurgo/js-chain-libs/js_chain_libs';
import type { CanonicalAddressInsert } from '../../lib/storage/database/primitives/tables';
import { CoreAddressTypes } from '../../lib/storage/database/primitives/enums';
import type { Bip44ChainInsert } from '../../lib/storage/database/walletTypes/common/tables';

declare var CONFIG: ConfigType;
const addressRequestSize = CONFIG.app.addressRequestSize;

export function genSingleAddressBatchFunc(
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

export async function addShelleyChimericAccountAddress(
  addByHash: AddByHashFunc,
  insertRequest: InsertRequest,
  stakingKey: RustModule.WalletV3.PublicKey,
  discrimination: AddressDiscriminationType,
): Promise<{|
  KeyDerivationId: number,
|}> {
  const accountAddr = RustModule.WalletV3.Address.account_from_public_key(
    stakingKey,
    discrimination,
  );
  await addByHash({
    ...insertRequest,
    address: {
      type: CoreAddressTypes.SHELLEY_ACCOUNT,
      data: Buffer.from(accountAddr.as_bytes()).toString('hex'),
    },
  });

  return {
    KeyDerivationId: insertRequest.keyDerivationId,
  };
}

export async function addShelleyUtxoAddress(
  addByHash: AddByHashFunc,
  insertRequest: InsertRequest,
  stakingKey: RustModule.WalletV3.PublicKey,
  singleAddress: string,
): Promise<{|
  KeyDerivationId: number,
|}> {
  const paymentAddr = RustModule.WalletV3.Address.from_bytes(Buffer.from(singleAddress, 'hex'));
  const singleAddr = paymentAddr.to_single_address();
  if (singleAddr == null) {
    throw new Error('addShelleyUtxoAddress address is not a single address');
  }
  const paymentKey = singleAddr.get_spending_key();
  await addByHash({
    ...insertRequest,
    address: {
      type: CoreAddressTypes.SHELLEY_SINGLE,
      data: singleAddress,
    },
  });
  const groupAddr = RustModule.WalletV3.Address.delegation_from_public_key(
    paymentKey,
    stakingKey,
    paymentAddr.get_discrimination()
  );
  await addByHash({
    ...insertRequest,
    address: {
      type: CoreAddressTypes.SHELLEY_GROUP,
      data: Buffer.from(groupAddr.as_bytes()).toString('hex'),
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
  stakingKey: RustModule.WalletV3.PublicKey,
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
          return await addShelleyUtxoAddress(
            request.addByHash,
            insertRequest,
            request.stakingKey,
            address
          );
        },
      };
    });
}

export async function scanCip1852Account(request: {|
  accountPublicKey: string,
  lastUsedInternal: number,
  lastUsedExternal: number,
  checkAddressesInUse: FilterFunc,
  addByHash: AddByHashFunc,
  stakingKey: RustModule.WalletV3.PublicKey,
|}): Promise<TreeInsert<Bip44ChainInsert>> {
  const key = RustModule.WalletV3.Bip32PublicKey.from_bytes(
    Buffer.from(request.accountPublicKey, 'hex'),
  );
  const discrimination = environment.getDiscriminant();

  const insert = await scanAccount({
    generateInternalAddresses: genSingleAddressBatchFunc(
      key.derive(ChainDerivations.INTERNAL),
      discrimination,
    ),
    generateExternalAddresses: genSingleAddressBatchFunc(
      key.derive(ChainDerivations.EXTERNAL),
      discrimination,
    ),
    lastUsedInternal: request.lastUsedInternal,
    lastUsedExternal: request.lastUsedExternal,
    checkAddressesInUse: request.checkAddressesInUse,
    addByHash: request.addByHash,
    stakingKey: request.stakingKey,
    discrimination,
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
  stakingKey: RustModule.WalletV3.PublicKey,
  discrimination: AddressDiscriminationType,
|}): Promise<TreeInsert<Bip44ChainInsert>> {
  const externalAddresses = await scanChain({
    generateAddressFunc: request.generateExternalAddresses,
    lastUsedIndex: request.lastUsedExternal,
    checkAddressesInUse: request.checkAddressesInUse,
    addByHash: request.addByHash,
    stakingKey: request.stakingKey,
  });
  const internalAddresses = await scanChain({
    generateAddressFunc: request.generateInternalAddresses,
    lastUsedIndex: request.lastUsedInternal,
    checkAddressesInUse: request.checkAddressesInUse,
    addByHash: request.addByHash,
    stakingKey: request.stakingKey,
  });

  const accountAddress = [0].map(i => ({
    index: i,
    insert: async insertRequest => {
      return await addShelleyChimericAccountAddress(
        request.addByHash,
        insertRequest,
        request.stakingKey,
        request.discrimination
      );
    },
  }));

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
    },
    {
      index: ChainDerivations.CHIMERIC_ACCOUNT,
      insert: insertRequest => Promise.resolve({
        KeyDerivationId: insertRequest.keyDerivationId,
        DisplayCutoff: null,
      }),
      children: accountAddress,
    }
  ];
}
