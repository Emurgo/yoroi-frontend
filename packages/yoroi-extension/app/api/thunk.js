// @flow

import { schema } from 'lovefield';
import { loadLovefieldDBFromDump } from './ada/lib/storage/database';
import type { lf$Database, } from 'lovefield';
import type { WalletState } from '../../chrome/extension/background/types';
import { HaskellShelleyTxSignRequest } from './ada/transactions/shelley/HaskellShelleyTxSignRequest';
import type { TokenRow } from './ada/lib/storage/database/primitives/tables';
import type { TxMemoTableInsert, TxMemoTableRow, TxMemoLookupKey, } from './ada/lib/storage/bridge/memos';
/*::
declare var chrome;
*/

function callBackground<T, R>(message: T): Promise<R> {
  return new Promise((resolve, reject) => {
    window.chrome.runtime.sendMessage(message, response => {
      if (window.chrome.runtime.lastError) {
        // eslint-disable-next-line prefer-promise-reject-errors
        reject(`Error when calling the background with: ${JSON.stringify(message) ?? 'undefined'}`);
        return;
      }
      resolve(response);
    });
  });
}

const DATE_REGEX = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*))(?:Z|(\+|-)([\d|:]*))?$/;

export async function getDb(): Promise<lf$Database> {
  const dataStr = await callBackground({ type: 'get-db' });
  const data = JSON.parse(dataStr, (key, value) => {
    if (typeof value === 'string' && DATE_REGEX.exec(value)) {
      return new Date(value);
    }
    return value;
  });
  return await loadLovefieldDBFromDump(schema.DataStoreType.MEMORY, data);
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  //fixme: verify sender.id/origin
});

export async function subscribeWalletStateChanges(): Promise<Array<WalletState>> {
  return await callBackground({ type: 'subscribe-wallet-state-changes' });
}

export type CreateWalletRequest = {|
  networkId: number,
  recoveryPhrase: string,
  walletName: string,
  walletPassword: string,
  accountIndex: number,
|};

export async function createWallet(request: CreateWalletRequest): Promise<void> {
  return await callBackground({ type: 'create-wallet', request, });
}

export type CreateHardwareWalletRequest = any;
export async function createHardwareWallet(request: CreateHardwareWalletRequest): Promise<WalletState> {
  return await callBackground({ type: 'create-hardware-wallet', request, });
}

/*
export async function getBalance(publicDeriverId: number): Promise<MultiToken> {
  return await callBackground({
    type: 'get-balance',
    request: { publicDeriverId },
  });
}
*/

// todo: notify all tabs
// WalletSettingsStore.js
export async function removeWalletFromDb(request: {| publicDeriverId: number |}): Promise<void> {
  await callBackground({ type: 'remove-wallet', request, });
}

type ChangeSigningKeyPasswordType = {|
  publicDeriverId: number,
  oldPassword: string,
  newPassword: string,
|};
export async function changeSigningKeyPassword(request: ChangeSigningKeyPasswordType): Promise<void> {
  await callBackground({ type: 'change-signing-password', request, });
}

export async function renamePublicDeriver(request: {| publicDeriverId: number, newName: string |}): Promise<void> {
  await callBackground({ type: 'rename-public-deriver', request, });
}

export async function renameConceptualWallet(
  request: {| conceptualWalletId: number, newName: string |}
): Promise<void> {
  await callBackground({ type: 'rename-conceputal-wallet', request, });
}

// AdaMnemonicSendStore.signAndBroadcast
// AdaTransactionsStore.recordSubmittedTransaction
export async function signAndBroadcast(
  request: {|
    signRequest: HaskellShelleyTxSignRequest,
    password: string,
    publicDeriverId: number,
  |}
): Promise<{| txId: string |}> {
  return await callBackground({ type: 'sign-and-broadcast', request, });
}

export async function getPrivateStakingKey(
  request: {| publicDeriverId: number, password: string |}
): Promise<string> {
  return await callBackground({ type: 'get-private-staking-key', request });
}

// TokenInfoStore.fetchMissingTokenInfo
// [... assertMap.values()]
export async function getCardanoAssets(
  request: {| networkId: number, tokenIds: Array<string> |}
): Promise<Array<$ReadOnly<TokenRow>>> {
  return await callBackground({ type: 'get-cardano-asset-map', request, });
}

export async function upsertTxMemo(
  request: {| publicDeriverId: number, memo: TxMemoTableInsert | TxMemoTableRow, |},
): Promise<TxMemoTableRow> {
  return await callBackground({ type: 'upsert-tx-memo', request, });
}

export async function deleteTxMemo(
  request: {| publicDeriverId: number, key: TxMemoLookupKey, |},
): Promise<void> {
  await callBackground({ type: 'delete-tx-memo', request, });
}

export async function getAllTxMemos(): Promise<$ReadOnlyArray<$ReadOnly<TxMemoTableRow>>> {
  await callBackground({ type: 'get-all-tx-memos' });
}

export async function removeAllTransactions(
  request: {| publicDeriverId: number |},
): Promise<void> {
  await callBackground({ type: 'remove-all-transactions' });
}
