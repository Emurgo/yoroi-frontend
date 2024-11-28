// @flow

// Handle migration to newer versions of Yoroi

import type { lf$Database } from 'lovefield';
import {
  clearStorageV1,
  getCurrentCryptoAccount,
  getLegacyAddressesList,
  legacyGetLastReceiveAddressIndex,
  legacyGetLocalStorageWallet,
  legacySaveLastReceiveAddressIndex,
  legacyStorageKeys,
  resetLegacy,
} from './database/legacy';
import LocalStorageApi from '../../../localStorage/index';
import { Logger, } from '../../../../utils/logging';
import satisfies from 'semver/functions/satisfies';
import { TabIdKeys, } from '../../../../utils/tabManager';
import { migrateFromStorageV1 } from './bridge/walletBuilder/byron';
import { RustModule } from '../cardanoCrypto/rustLoader';
import { removeAllTransactions } from './bridge/updateTransactions';
import { removePublicDeriver } from './bridge/walletBuilder/remove';
import { asGetAllUtxos, asHasLevels, } from './models/PublicDeriver/traits';
import { ConceptualWallet, isLedgerNanoWallet, } from './models/ConceptualWallet/index';
import { loadWalletsFromStorage } from './models/load';
import environment from '../../../../environment';
import { KeyKind } from '../cardanoCrypto/keys/types';
import { getLocalItem, removeLocalItem, } from '../../../localStorage/primitives';
import { isCardanoHaskell, networks } from './database/prepackaged/networks';
import { getAllSchemaTables, raii, } from './database/utils';
import type { BlockRow } from './database/primitives/tables';
import { GetBlock } from './database/primitives/api/read';
import { ModifyUtxoAtSafePoint } from './database/utxo/api/write';

export async function migrateToLatest(
  localStorageApi: LocalStorageApi,
  persistentDb: lf$Database,
): Promise<boolean> {
  // recall: last launch was only added in Yoroi 1.4.0 and returns 0.0.0 before that
  let lastLaunchVersion = await localStorageApi.getLastLaunchVersion();
  Logger.info(`Starting migration for ${lastLaunchVersion}`);
  /**
   * Note: Although we don't start migration if the user is running a fresh installation
   * We still cannot be certain any key exists in localstorage
   *
   * For example, somebody may have downloaded Yoroi a long time ago
   * but only completed the language select before closing the application
   *
   * Therefore, you need to always check that data exists before migrating it
   */

  /**
    * Note: Be careful about the kinds of migrations you do here.
    * You are essentially swapping the app state under the hood
    * Therefore mobx may not notice the change as expected
    */

  const migrationMap: Array<[string, () => Promise<boolean>]> = [
    ['=0.0.1', async () => await testMigration(localStorageApi)],
    /**
     * We changed the place where Yoroi data is stored so  we must process this migration first
     * to ensure other migrations look at the right place for storage
     */
    /* disable this since window.localStorage is not available to manifest v3 service worker
    ['<1.9.0', async () => {
      const applied = await moveStorage(localStorageApi);
      if (applied) {
        // update last launch version to what's in the new storage location
        lastLaunchVersion = await localStorageApi.getLastLaunchVersion();
      }
      return applied;
    }],
    */
    ['<1.4.0', async () => await bip44Migration()],
    ['<1.10.0', async () => await storageV2Migration(persistentDb)],
    ['=1.10.0', async () => await cardanoTxHistoryReset(persistentDb)],
    ['>=2.0.0 <2.4.0', async () => await cardanoTxHistoryReset(persistentDb)],
    ['<3.0.0', async () => {
      const result = await getLocalItem(legacyStorageKeys.SELECTED_EXPLORER_KEY);
      if (result != null) {
        await removeLocalItem(legacyStorageKeys.SELECTED_EXPLORER_KEY);
        return true;
      }
      return false;
    }],
    ['<3.3.0', async () => {
      const txHistoryWasReset = await cardanoTxHistoryReset(persistentDb);
      /**
       * We remove all Ledger wallets for two reasons:
       * 1) Some Ledger wallets were accidentally created as CIP1852 wallets using the BIP44 key
       * 2) All Ledger wallets didn't have a serial number associated with them,
       *    but now we can add one on wallet creation
       */
      const ledgerDeviceWasRemove = await removeLedgerDevices(persistentDb);
      return txHistoryWasReset || ledgerDeviceWasRemove;
    }],
    ['<3.8.0', () => cardanoTxHistoryReset(persistentDb)],
    ['<4.18', () => populateNewUtxodata(persistentDb)],
    ['<5.4', () => unsetLegacyThemeFlags(localStorageApi)],
  ];

  let appliedMigration = false;
  for (const entry of migrationMap) {
    if (satisfies(lastLaunchVersion, entry[0])) {
      Logger.info(`Migration started for ${entry[0]}`);
      const applied = await entry[1]();
      if (applied) {
        Logger.info(`Applied migration for ${entry[0]}`);
        appliedMigration = true;
      } else {
        Logger.info(`No need to apply migration for ${entry[0]}`);
      }
    }
  }

  return appliedMigration;
}

/**
 * We use this as a dummy migration so that our tests can verify migration is working correctly
 */
async function testMigration(localStorageApi: LocalStorageApi): Promise<boolean> {
  // changing the locale is something we can easily detect from our tests
  Logger.info(`Starting testMigration`);
  // Note: mobx will not notice this change until you refresh
  await localStorageApi.setUserLocale('ja-JP');
  return true;
}

/**
 * Previous version of Yoroi used window.localStorage
 * since version 1.9 this storage needs to be moved to storage.local.
 * This function must go before other modifications because they will work over storage.local.
 */
// eslint-disable-next-line no-unused-vars
async function moveStorage(localStorageApi: LocalStorageApi): Promise<boolean> {
  // Note: this function assumes nobody is using Yoroi as a  website (at least before 1.9.0)
  const oldStorage = await localStorageApi.getOldStorage();
  if (oldStorage.length === 0) {
    return false;
  }
  if (oldStorage.length === 1 && oldStorage[TabIdKeys.Primary] != null) {
    // old storage may contain just the tab id
    // since this field is re-generated every time the app launches in the right storage
    // we can just clear it
    oldStorage.clear();
    return false;
  }
  await localStorageApi.setStorage(oldStorage);
  oldStorage.clear();
  return true;
}

/**
 * Previous version of Yoroi were not BIP44 compliant
 * Notably, it didn't scan 20 addresses ahead of the last used address.
 * This causes desyncs when you use Yoroi either on multiple computers with the same wallet
 * or you use the same wallet on Chrome + mobile.
 */
async function bip44Migration(
): Promise<boolean> {
  Logger.info(`Starting bip44Migration`);
  const addresses = getLegacyAddressesList();

  /**
   * We used to consider all addresses in the DB as explicitly generated by the user
   * However, BIP44 requires us to also store 20 addresses after the last used address
   * Therefore the highest index in the old format is the highest generated for new format
   */
  const maxIndex = Math.max(
    ...addresses
      .filter(address => address.change === 0)
      .map(address => address.index),
    0
  );

  // if we had more than one address, then the WALLET key must exist in localstorage
  try {
    await legacySaveLastReceiveAddressIndex(maxIndex);
  } catch (_err) {
    // no wallet in storage
    return false;
  }
  /**
   * Once we've saved the receive address, we dump the DB entirely
   * We need to do this since old wallets may have incorrect history
   * Due to desync issue caused by the incorrect bip44 implementation
   */
  resetLegacy();

  return true;
}

/**
 * Previous version of Yoroi only supported 1 wallet
 * This migrates to a new storage format to allow multiple wallets and different kinds of wallets
 * see v2 storage spec for more details
 */
// <TODO:PENDING_REMOVAL> legacy migration
export async function storageV2Migration(
  persistentDb: lf$Database,
): Promise<boolean> {
  // all information in the v1 indexedDb can be inferred from the blockchain
  const hasEntries = resetLegacy();
  // in test environment we don't have historic indexedDb values before this version
  if (!hasEntries && !environment.isTest()) {
    return false;
  }

  const wallet = await legacyGetLocalStorageWallet();
  const account = await getCurrentCryptoAccount();
  if (wallet != null && account != null) {
    const lastReceiveIndex = await legacyGetLastReceiveAddressIndex();

    // all wallets used this at the time
    const network = networks.CardanoMainnet;
    if (network.BaseConfig[0].ByronNetworkId == null) {
      throw new Error(`missing Byron network id`);
    }
    const { ByronNetworkId } = network.BaseConfig[0];
    const settings = RustModule.WalletV2.BlockchainSettings.from_json({
      protocol_magic: ByronNetworkId
    });
    await migrateFromStorageV1({
      db: persistentDb,
      accountPubKey: account.root_cached_key,
      displayCutoff: lastReceiveIndex,
      encryptedPk: wallet.masterKey == null
        ? undefined
        : {
          Hash: wallet.masterKey,
          IsEncrypted: true,
          PasswordLastUpdate: wallet.adaWallet.cwPassphraseLU == null
            ? null
            : new Date(wallet.adaWallet.cwPassphraseLU),
          Type: KeyKind.BIP32ED25519,
        },
      hwWalletMetaInsert: wallet.adaWallet.cwHardwareInfo == null
        ? undefined
        : {
          Vendor: wallet.adaWallet.cwHardwareInfo.vendor,
          Model: wallet.adaWallet.cwHardwareInfo.model,
          DeviceId: wallet.adaWallet.cwHardwareInfo.deviceId,
        },
      settings,
      walletName: wallet.adaWallet.cwMeta.cwName,
      network,
    });
  }

  await clearStorageV1();
  return true;
}

/**
 * clear the transaction history for all wallets
 * useful if there was a bug in transaction processing
 */
export async function cardanoTxHistoryReset(
  persistentDb: lf$Database,
): Promise<boolean> {
  const wallets = await loadWalletsFromStorage(persistentDb);
  if (wallets.length === 0) {
    return false;
  }

  for (const publicDeriver of wallets) {
    const withLevels = asHasLevels<ConceptualWallet>(publicDeriver);
    if (!isCardanoHaskell(publicDeriver.getParent().getNetworkInfo())) {
      continue;
    }
    if (withLevels == null) {
      throw new Error(`${nameof(cardanoTxHistoryReset)} missing levels`);
    }
    await removeAllTransactions({ publicDeriver: withLevels });
  }

  return true;
}

async function removeLedgerDevices(
  persistentDb: lf$Database,
): Promise<boolean> {
  const wallets = await loadWalletsFromStorage(persistentDb);
  if (wallets.length === 0) {
    return false;
  }

  let removedAWallet = false;
  for (const publicDeriver of wallets) {
    if (!isLedgerNanoWallet(publicDeriver.getParent())) {
      continue;
    }
    // recall: at this time we didn't support multi-account
    await removePublicDeriver({
      publicDeriver,
      conceptualWallet: publicDeriver.getParent(),
    });
    removedAWallet = true;
  }
  return removedAWallet;
}

export async function populateNewUtxodata(
  persistentDb: lf$Database,
): Promise<boolean> {
  const wallets = await loadWalletsFromStorage(persistentDb);
  if (wallets.length === 0) {
    return false;
  }

  for (const publicDeriver of wallets) {
    try {
      if (!isCardanoHaskell(publicDeriver.getParent().getNetworkInfo())) {
        continue;
      }

      const withGetAllUtxos = asGetAllUtxos(publicDeriver);
      if (!withGetAllUtxos) {
        throw new Error('unexpected missing trait');
      }

      const lastSyncInfo = await publicDeriver.getLastSyncInfo();
      const utxos = await withGetAllUtxos.getAllUtxosFromOldDb();

      const blockIds = utxos.map(utxo => {
        // We are using the old getAllUtxos, it does have the BlockId field
        // $FlowFixMe[prop-missing]
        const blockId = utxo.output.Transaction.BlockId;
        if (blockId == null) {
          throw new Error('expect transaction to have block ID');
        }
        return blockId;
      });

      const db = publicDeriver.getDb();
      const blocks = await raii<$ReadOnlyArray<$ReadOnly<BlockRow>>>(
        db,
        getAllSchemaTables(db, GetBlock),
        tx => GetBlock.byIds(db, tx, blockIds)
      );
      // block ID => block height
      const blockMap = new Map<number, number>(
        blocks.map(block => [block.BlockId, block.Height])
      );
      const newUtxos = utxos.map(utxo => {
        const txIndex = utxo.output.UtxoTransactionOutput.OutputIndex;
        const txHash = utxo.output.Transaction.Hash;
        const defaultTokenId = '';
        const isDefaultToken = token => token.Token.Identifier === defaultTokenId;
        const defaultToken = utxo.output.tokens.find(isDefaultToken);
        const assets = utxo.output.tokens
          .filter(token => !isDefaultToken(token))
          .map(token => {
            const { Metadata } = token.Token;
            if (Metadata.type !== 'Cardano') {
              throw new Error('unexpected token metadata type');
            }
            return {
              assetId: token.Token.Identifier,
              policyId: Metadata.policyId,
              name: Metadata.assetName,
              amount: token.TokenList.Amount,
            }
          });
        // We are using the old getAllUtxos, it does have the BlockId field
        // $FlowFixMe[prop-missing]
        const blockId = utxo.output.Transaction.BlockId;
        if (blockId == null) {
          throw new Error('expect transaction to have block ID');
        }
        const blockNum = blockMap.get(blockId);
        if (blockNum == null) {
          throw new Error(`can't find block info for ${blockId}`);
        }
        if (defaultToken == null) {
          throw new Error(`missing default token`);
        }
        return {
          utxoId: `${txHash}${txIndex}`,
          txHash,
          txIndex,
          receiver: utxo.address,
          amount: defaultToken.TokenList.Amount,
          assets,
          blockNum
        };
      });
      const blockHash = lastSyncInfo.BlockHash;
      if (blockHash == null) {
        throw new Error('missing block hash');
      }
      await raii<void>(
        db,
        getAllSchemaTables(db, ModifyUtxoAtSafePoint),
        tx => ModifyUtxoAtSafePoint.addOrReplace(
          db,
          tx,
          publicDeriver.getPublicDeriverId(),
          {
            lastSafeBlockHash: blockHash,
            utxos: newUtxos
          }
        )
      );
    } catch(error) {
       Logger.warn(`UTXO storage migration failed: ${error}`);
       // It's OK to leave the UTXO storage empty, as Yoroi-lib UtxoService will
       // sync from the beginning
    }
  }

  return true;
}

async function unsetLegacyThemeFlags(localStorageApi: LocalStorageApi): Promise<boolean> {
  const hasLegacyFlags = await localStorageApi.hasAnyLegacyThemeFlags();
  if (!hasLegacyFlags) {
    return false;
  }
  await localStorageApi.unsetLegacyThemeFlags();
  return true;
}