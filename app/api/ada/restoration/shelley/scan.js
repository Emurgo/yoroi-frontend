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

import { RustModule } from '../../lib/cardanoCrypto/rustLoader';

import type {
  TreeInsert, InsertRequest,
} from '../../lib/storage/database/walletTypes/common/utils';
import type { AddByHashFunc, } from '../../../common/lib/storage/bridge/hashMapper';
import type { CanonicalAddressInsert } from '../../lib/storage/database/primitives/tables';
import { CoreAddressTypes } from '../../lib/storage/database/primitives/enums';
import type { Bip44ChainInsert } from '../../lib/storage/database/walletTypes/common/tables';

// populated by ConfigWebpackPlugin
declare var CONFIG: ConfigType;
const addressRequestSize = CONFIG.app.addressRequestSize;

// TODO: delete this function eventually once we support payment addresses in the backend
function genEnterpriseAddressBatchFunc(
  addressChain: RustModule.WalletV4.Bip32PublicKey,
  chainNetworkId: number,
): GenerateAddressFunc {
  return (
    indices: Array<number>
  ) => {
    return indices.map(i => {
      const addressKey = addressChain.derive(i).to_raw_key();
      const addr = RustModule.WalletV4.EnterpriseAddress.new(
        chainNetworkId,
        RustModule.WalletV4.StakeCredential.from_keyhash(addressKey.hash())
      );
      const asHex = Buffer.from(addr.to_address().to_bytes()).toString('hex');
      return asHex;
    });
  };
}

// TODO: delete this function eventually once we support payment addresses in the backend
function genBaseAddressBatchFunc(
  addressChain: RustModule.WalletV4.Bip32PublicKey,
  stakingKey: RustModule.WalletV4.PublicKey,
  chainNetworkId: number,
): GenerateAddressFunc {
  return (
    indices: Array<number>
  ) => {
    return indices.map(i => {
      const addressKey = addressChain.derive(i).to_raw_key();
      const addr = RustModule.WalletV4.BaseAddress.new(
        chainNetworkId,
        RustModule.WalletV4.StakeCredential.from_keyhash(addressKey.hash()),
        RustModule.WalletV4.StakeCredential.from_keyhash(stakingKey.hash())
      );
      const bech32 = addr.to_address().to_bech32();
      return bech32;
    });
  };
}


export async function addShelleyChimericAccountAddress(
  addByHash: AddByHashFunc,
  insertRequest: InsertRequest,
  stakingKey: RustModule.WalletV4.PublicKey,
  chainNetworkId: number,
): Promise<{|
  KeyDerivationId: number,
|}> {
  const accountAddr = RustModule.WalletV4.RewardAddress.new(
    chainNetworkId,
    RustModule.WalletV4.StakeCredential.from_keyhash(stakingKey.hash()),
  );
  await addByHash({
    ...insertRequest,
    address: {
      type: CoreAddressTypes.CARDANO_REWARD,
      data: Buffer.from(accountAddr.to_address().to_bytes()).toString('hex'),
    },
  });

  return {
    KeyDerivationId: insertRequest.keyDerivationId,
  };
}

export async function addShelleyUtxoAddress(
  addByHash: AddByHashFunc,
  insertRequest: InsertRequest,
  stakingKey: RustModule.WalletV4.PublicKey,
  baseAddresses: string, // bech32
): Promise<{|
  KeyDerivationId: number,
|}> {
  const wasmAddr = RustModule.WalletV4.Address.from_bech32(baseAddresses);
  const wasmBaseAddr = RustModule.WalletV4.BaseAddress.from_address(wasmAddr);
  if (wasmBaseAddr == null) {
    throw new Error(`${nameof(addShelleyUtxoAddress)} address is not an enterprise address`);
  }
  const baseAddr = RustModule.WalletV4.EnterpriseAddress.new(
    wasmAddr.network_id(),
    wasmBaseAddr.payment_cred()
  );
  await addByHash({
    ...insertRequest,
    address: {
      type: CoreAddressTypes.CARDANO_ENTERPRISE,
      data: Buffer.from(baseAddr.to_address().to_bytes()).toString('hex'),
    },
  });
  await addByHash({
    ...insertRequest,
    address: {
      type: CoreAddressTypes.CARDANO_BASE,
      data: Buffer.from(wasmBaseAddr.to_address().to_bytes()).toString('hex'),
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
  stakingKey: RustModule.WalletV4.PublicKey,
  addByHash: AddByHashFunc,
|}): Promise<TreeInsert<CanonicalAddressInsert>> {
  const addresses = await discoverAllAddressesFrom(
    request.generateAddressFunc,
    request.lastUsedIndex,
    BIP44_SCAN_SIZE,
    addressRequestSize,
    request.checkAddressesInUse,
  );

  /**
   * TODO: we need an endpoint here that
   * gets all the certificates ever registered with the staking key
   * that way we can properly generate pointer addresses ahead of time
   */

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

export async function scanShelleyCip1852Account(request: {|
  accountPublicKey: string,
  lastUsedInternal: number,
  lastUsedExternal: number,
  checkAddressesInUse: FilterFunc,
  addByHash: AddByHashFunc,
  stakingKey: RustModule.WalletV4.PublicKey,
  chainNetworkId: number,
|}): Promise<TreeInsert<Bip44ChainInsert>> {
  const key = RustModule.WalletV4.Bip32PublicKey.from_bytes(
    Buffer.from(request.accountPublicKey, 'hex'),
  );

  const insert = await scanAccount({
    generateInternalAddresses: genBaseAddressBatchFunc(
      key.derive(ChainDerivations.INTERNAL),
      request.stakingKey,
      request.chainNetworkId,
    ),
    generateExternalAddresses: genBaseAddressBatchFunc(
      key.derive(ChainDerivations.EXTERNAL),
      request.stakingKey,
      request.chainNetworkId,
    ),
    lastUsedInternal: request.lastUsedInternal,
    lastUsedExternal: request.lastUsedExternal,
    checkAddressesInUse: request.checkAddressesInUse,
    addByHash: request.addByHash,
    stakingKey: request.stakingKey,
    chainNetworkId: request.chainNetworkId,
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
  stakingKey: RustModule.WalletV4.PublicKey,
  chainNetworkId: number,
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
        request.chainNetworkId
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
