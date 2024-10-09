// @flow

// Handle restoring wallets that follow cip1852

import {
  discoverAllAddressesFrom,
} from '../../../common/lib/restoration/bip44AddressScan';
import type {
  GenerateAddressFunc,
} from '../../../common/lib/restoration/bip44AddressScan';
import type { ConfigType } from '../../../../../config/config-types';

import {
  ChainDerivations, BIP44_SCAN_SIZE,
} from '../../../../config/numbersConfig';

import { RustModule } from '../../lib/cardanoCrypto/rustLoader';

import type {
  TreeInsert, InsertRequest,
} from '../../lib/storage/database/walletTypes/common/utils.types';
import type { AddByHashFunc, } from '../../../common/lib/storage/bridge/hashMapper';
import type { NetworkRow, CanonicalAddressInsert } from '../../lib/storage/database/primitives/tables';
import { CoreAddressTypes } from '../../lib/storage/database/primitives/enums';
import type { Bip44ChainInsert } from '../../lib/storage/database/walletTypes/common/tables';
import { getCardanoHaskellBaseConfig } from '../../lib/storage/database/prepackaged/networks';
import { Bech32Prefix } from '../../../../config/stringConfig';
import type { FilterFunc } from '../../lib/state-fetch/types';

// populated by ConfigWebpackPlugin
declare var CONFIG: ConfigType;
const addressRequestSize = CONFIG.app.addressRequestSize;

function genKeyhashBatchFunc(
  addressChain: RustModule.WalletV4.Bip32PublicKey,
): GenerateAddressFunc {
  return (
    indices: Array<number>
  ) => {
    return indices.map(i => {
      const addressKey = addressChain.derive(i).to_raw_key();
      return addressKey.hash().to_bech32(Bech32Prefix.PAYMENT_KEY_HASH);
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
    RustModule.WalletV4.Credential.from_keyhash(stakingKey.hash()),
  );
  await addByHash({
    ...insertRequest,
    address: {
      type: CoreAddressTypes.CARDANO_REWARD,
      data: accountAddr.to_address().to_hex(),
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
  keyHash: RustModule.WalletV4.Ed25519KeyHash,
  networkId: number,
): Promise<{|
  KeyDerivationId: number,
|}> {
  const wasmEnterpriseAddr = RustModule.WalletV4.EnterpriseAddress.new(
    networkId,
    RustModule.WalletV4.Credential.from_keyhash(keyHash)
  );
  if (wasmEnterpriseAddr == null) {
    throw new Error(`${nameof(addShelleyUtxoAddress)} address is not an enterprise address`);
  }
  const baseAddr = RustModule.WalletV4.BaseAddress.new(
    networkId,
    wasmEnterpriseAddr.payment_cred(),
    RustModule.WalletV4.Credential.from_keyhash(stakingKey.hash())
  );
  await addByHash({
    ...insertRequest,
    address: {
      type: CoreAddressTypes.CARDANO_ENTERPRISE,
      data: wasmEnterpriseAddr.to_address().to_hex(),
    },
  });
  await addByHash({
    ...insertRequest,
    address: {
      type: CoreAddressTypes.CARDANO_BASE,
      data: baseAddr.to_address().to_hex(),
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
  network: $ReadOnly<NetworkRow>,
|}): Promise<TreeInsert<CanonicalAddressInsert>> {
  const addresses = await discoverAllAddressesFrom(
    request.generateAddressFunc,
    request.lastUsedIndex,
    BIP44_SCAN_SIZE,
    addressRequestSize,
    request.checkAddressesInUse,
    request.network,
  );

  const config = getCardanoHaskellBaseConfig(
    request.network
  ).reduce((acc, next) => Object.assign(acc, next), {});

  /**
   * TODO: we need an endpoint here that
   * gets all the certificates ever registered with the staking key
   * that way we can properly generate pointer addresses ahead of time
   */

  return addresses
    .map(({ address, isUsed }, i) => {
      return {
        index: i + request.lastUsedIndex + 1,
        insert: async insertRequest => {
          return await addShelleyUtxoAddress(
            request.addByHash,
            insertRequest,
            request.stakingKey,
            RustModule.WalletV4.Ed25519KeyHash.from_bech32(address),
            Number.parseInt(config.ChainNetworkId, 10),
          );
        },
        isUsed,
        address,
      };
    });
}

// <TODO:PENDING_REMOVAL> legacy
export async function scanShelleyCip1852Account(request: {|
  accountPublicKey: string,
  lastUsedInternal: number,
  lastUsedExternal: number,
  network: $ReadOnly<NetworkRow>,
  checkAddressesInUse: FilterFunc,
  addByHash: AddByHashFunc,
  stakingKey: RustModule.WalletV4.PublicKey,
|}): Promise<TreeInsert<Bip44ChainInsert>> {
  const key = RustModule.WalletV4.Bip32PublicKey.from_hex(request.accountPublicKey);

  const config = getCardanoHaskellBaseConfig(
    request.network
  ).reduce((acc, next) => Object.assign(acc, next), {});

  const insert = await scanAccount({
    generateInternalAddresses: genKeyhashBatchFunc(
      key.derive(ChainDerivations.INTERNAL),
    ),
    generateExternalAddresses: genKeyhashBatchFunc(
      key.derive(ChainDerivations.EXTERNAL),
    ),
    lastUsedInternal: request.lastUsedInternal,
    lastUsedExternal: request.lastUsedExternal,
    network: request.network,
    checkAddressesInUse: request.checkAddressesInUse,
    addByHash: request.addByHash,
    stakingKey: request.stakingKey,
    chainNetworkId: Number.parseInt(config.ChainNetworkId, 10),
  });
  return insert;
}
async function scanAccount(request: {|
  generateInternalAddresses: GenerateAddressFunc,
  generateExternalAddresses: GenerateAddressFunc,
  lastUsedInternal: number,
  lastUsedExternal: number,
  network: $ReadOnly<NetworkRow>,
  checkAddressesInUse: FilterFunc,
  addByHash: AddByHashFunc,
  stakingKey: RustModule.WalletV4.PublicKey,
  chainNetworkId: number,
|}): Promise<TreeInsert<Bip44ChainInsert>> {
  const externalAddresses = await scanChain({
    generateAddressFunc: request.generateExternalAddresses,
    lastUsedIndex: request.lastUsedExternal,
    network: request.network,
    checkAddressesInUse: request.checkAddressesInUse,
    addByHash: request.addByHash,
    stakingKey: request.stakingKey,
  });
  const internalAddresses = await scanChain({
    generateAddressFunc: request.generateInternalAddresses,
    lastUsedIndex: request.lastUsedInternal,
    network: request.network,
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
