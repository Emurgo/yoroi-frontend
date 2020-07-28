// @flow

// Handle migration to newer versions of Yoroi

import type { lf$Database } from 'lovefield';
import {
  resetLegacy,
  getLegacyAddressesList,
  legacyGetLastReceiveAddressIndex,
  legacySaveLastReceiveAddressIndex,
  legacyGetLocalStorageWallet,
  getCurrentCryptoAccount,
  clearStorageV1,
  legacyStorageKeys,
} from './database/legacy';
import LocalStorageApi from '../../../localStorage/index';
import {
  Logger,
} from '../../../../utils/logging';
import satisfies from 'semver/functions/satisfies';
import {
  OPEN_TAB_ID_KEY,
} from '../../../../utils/tabManager';
import { migrateFromStorageV1 } from './bridge/walletBuilder/byron';
import { RustModule } from '../cardanoCrypto/rustLoader';
import { removeAllTransactions } from './bridge/updateTransactions';
import {
  asHasLevels,
} from './models/PublicDeriver/traits';
import {
  ConceptualWallet
} from './models/ConceptualWallet/index';
import { loadWalletsFromStorage } from './models/load';
import environment from '../../../../environment';
import { KeyKind } from '../../../common/lib/crypto/keys/types';
import {
  removeLocalItem,
} from '../../../localStorage/primitives';
import {
  isCardanoHaskell, networks
} from './database/prepackaged/networks';

export async function migrateToLatest(
  localStorageApi: LocalStorageApi,
  persistentDb: lf$Database,
): Promise<boolean> {
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
    ['<1.9.0', async () => {
      const applied = await moveStorage(localStorageApi);
      if (applied) {
        // update last launch version to what's in the new storage location
        lastLaunchVersion = await localStorageApi.getLastLaunchVersion();
      }
      return applied;
    }],
    ['<1.4.0', async () => await bip44Migration()],
    ['<1.10.0', async () => await storagev2Migation(persistentDb)],
    ['=1.10.0', async () => await cardanoTxHistoryReset(persistentDb)],
    ['>=2.0.0 <2.4.0', async () => await cardanoTxHistoryReset(persistentDb)],
    ['<3.0.0', async () => await removeLocalItem(legacyStorageKeys.SELECTED_EXPLORER_KEY)],
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
async function moveStorage(localStorageApi: LocalStorageApi): Promise<boolean> {
  // Note: this function assumes nobody is using Yoroi as a  website (at least before 1.9.0)
  const oldStorage = await localStorageApi.getOldStorage();
  if (oldStorage.length === 0) {
    return false;
  }
  if (oldStorage.length === 1 && oldStorage[OPEN_TAB_ID_KEY] != null) {
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
  const addresses = await getLegacyAddressesList();

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
  await resetLegacy();

  return true;
}

/**
 * Previous version of Yoroi only supported 1 wallet
 * This migrates to a new storage format to allow multiple wallets and different kinds of wallets
 * see v2 storage spec for more details
 */
export async function storagev2Migation(
  persistentDb: lf$Database,
): Promise<boolean> {
  // all information in the v1 indexdb can be inferred from the blockchain
  const hasEntries = await resetLegacy();
  // in test environment we don't have historic indexdb values before this version
  if (!hasEntries && !environment.isTest()) {
    return false;
  }

  const wallet = await legacyGetLocalStorageWallet();
  const account = await getCurrentCryptoAccount();
  if (wallet != null && account != null) {
    const lastReceiveIndex = await legacyGetLastReceiveAddressIndex();

    // all wallets used this at the time
    const network = networks.ByronMainnet;
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
