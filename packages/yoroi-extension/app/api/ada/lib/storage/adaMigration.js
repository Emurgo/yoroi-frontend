// @flow

// Handle migration to newer versions of Yoroi

import type { lf$Database } from 'lovefield';
import {
  legacyStorageKeys,
} from './database/legacy';
import LocalStorageApi from '../../../localStorage/index';
import { Logger, } from '../../../../utils/logging';
import satisfies from 'semver/functions/satisfies';
import { removeAllTransactions } from './bridge/updateTransactions';
import { removePublicDeriver } from './bridge/walletBuilder/remove';
import { asGetAllUtxos, asGetPublicKey, } from './models/PublicDeriver/traits';
import { isLedgerNanoWallet, } from './models/ConceptualWallet/index';
import { loadWalletsFromStorage } from './models/load';
import { getLocalItem, removeLocalItem, } from '../../../localStorage/primitives';
import { isCardanoHaskell } from './database/prepackaged/networks';
import { getAllSchemaTables, raii, } from './database/utils';
import type { BlockRow } from './database/primitives/tables';
import { GetBlock } from './database/primitives/api/read';
import { ModifyUtxoAtSafePoint } from './database/utxo/api/write';
import type { PublicDeriver } from './models/PublicDeriver/index';

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
    ['<5.6', () => migrateWalletOrderAndSelectedWalletForNetworkSwitch(persistentDb, localStorageApi)],
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
    await removeAllTransactions({ publicDeriver });
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

async function migrateWalletOrderAndSelectedWalletForNetworkSwitch(
  db: lf$Database,
  localStorageApi: LocalStorageApi,
): Promise<boolean> {
  const wallets = await loadWalletsFromStorage(db);

  const oldWalletOrder = (await localStorageApi.getWalletsNavigation())?.cardano || [];
  const publicKeyList = [];
  for (const id of oldWalletOrder) {
    const wallet = wallets.find(w => w.getPublicDeriverId() === id);
    if (wallet) {
      publicKeyList.push(await getPublicKey(wallet));
    }
  }
  for (const wallet of wallets) {
    if (!oldWalletOrder.includes(wallet.getPublicDeriverId())) {
      publicKeyList.push(await getPublicKey(wallet));
    }
  }
  await localStorageApi.saveWalletListOrder(publicKeyList);

  const selectedWalletId = await localStorageApi.getSelectedWalletId();
  const selectedWallet = wallets.find(
    wallet => wallet.getPublicDeriverId() === selectedWalletId
  );
  if (selectedWallet) {
    await localStorageApi.setSelectedWalletPublicKey(await getPublicKey(selectedWallet));
  }
  return true;
}

async function getPublicKey(publicDeriver: PublicDeriver<>): Promise<string> {
  const withPubKey = asGetPublicKey(publicDeriver);
  if (withPubKey == null) {
    throw new Error('unexpected missing asGetPublicKey result');
  }
  return (await withPubKey.getPublicKey()).Hash;
}
