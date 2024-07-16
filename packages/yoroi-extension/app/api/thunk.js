// @flow

import { schema } from 'lovefield';
import { loadLovefieldDBFromDump } from './ada/lib/storage/database';
import type { lf$Database, } from 'lovefield';
import type { WalletState, ServerStatus } from '../../chrome/extension/background/types';
import { HaskellShelleyTxSignRequest } from './ada/transactions/shelley/HaskellShelleyTxSignRequest';
import type { NetworkRow, TokenRow } from './ada/lib/storage/database/primitives/tables';
import type { TxMemoLookupKey, } from './ada/lib/storage/bridge/memos';
import type { TxMemoTableInsert, TxMemoTableRow, } from './ada/lib/storage/database/memos/tables';
import { RustModule } from './ada/lib/cardanoCrypto/rustLoader';
import type { CardanoAddressedUtxo } from './ada/transactions/types';
import type { HWFeatures, } from './ada/lib/storage/database/walletTypes/core/tables';
import WalletTransaction from '../domain/WalletTransaction';
import type { ReferenceTransaction } from './common';
import type { WalletAuthEntry } from '../../chrome/extension/connector/types';
import CardanoShelleyTransaction, {
  deserializeTransactionCtorData as deserializeShelleyTransactionCtorData,
} from '../domain/CardanoShelleyTransaction';
import CardanoByronTransaction, {
  deserializeTransactionCtorData as deserializeByronTransactionCtorData,
} from '../domain/CardanoByronTransaction';
import { MultiToken } from './common/lib/MultiToken';
import type { ExplorerRow, PreferredExplorerRow } from './ada/lib/storage/database/explorers/tables';

/*::
declare var chrome;
*/

// UI -> background queries:

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

//fixme: remove
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

function patchWalletState(walletState: Object): WalletState {
  const deserializeAddressesByType = addressesByType => addressesByType.map(
    addresses => addresses.map(
      address => ({
        ...address,
        // note: address.values should be non-null according to the type definition, but a bug
        // somewhere in the db layers actually returns null values
        values: address.values  && MultiToken.from(address.values),
      })
    )
  );

  walletState.submittedTransactions = walletState.submittedTransactions.map(
    ({ networkId, publicDeriverId, transaction, usedUtxos }) => ({
      networkId,
      publicDeriverId,
      transaction: deserializeShelleyTransactionCtorData(transaction),
      usedUtxos,
    })
  );
  walletState.balance = MultiToken.from(walletState.balance);
  walletState.assetDeposits = MultiToken.from(walletState.assetDeposits);

  walletState.allAddressesByType = deserializeAddressesByType(walletState.allAddressesByType);
  walletState.internalAddressesByType = deserializeAddressesByType(walletState.internalAddressesByType);
  walletState.externalAddressesByType = deserializeAddressesByType(walletState.externalAddressesByType);
  return walletState;
}

export async function getWallets(walletId?: number): Promise<Array<WalletState>> {
  const wallets = await callBackground({ type: 'get-wallets', request: { walletId } });

  for (const wallet of wallets) {
    patchWalletState(wallet);
  }
  return wallets;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  //fixme: verify sender.id/origin
});

export async function subscribe(activeWalletId: ?number): Promise<void> {
  await callBackground({ type: 'subscribe', request: { activeWalletId } });
}

export type CreateWalletRequestType = {|
  networkId: number,
  recoveryPhrase: string,
  walletName: string,
  walletPassword: string,
  accountIndex: number,
|};

export async function createWallet(request: CreateWalletRequestType): Promise<WalletState> {
  const resp = await callBackground({ type: 'create-wallet', request, });
  if (resp.error) {
    throw new Error(`error when creating wallet: ${resp.error}`);
  }
  return patchWalletState(resp.placeHolderWalletState);
}

export type CreateHardwareWalletRequestType = {|
  walletName: string,
  publicKey: string,
  addressing: {|
    path: Array<number>,
    startLevel: number,
  |},
  hwFeatures: HWFeatures,
  network: $ReadOnly<NetworkRow>,
|};
export async function createHardwareWallet(request: CreateHardwareWalletRequestType): Promise<WalletState> {
  const resp = await callBackground({ type: 'create-hardware-wallet', request, });
  if (resp.error) {
    throw new Error(`error when creating wallet: ${resp.error}`);
  }
  return patchWalletState(resp.placeHolderWalletState);
}

export async function removeWalletFromDb(request: {| publicDeriverId: number |}): Promise<void> {
  await callBackground({ type: 'remove-wallet', request, });
}

export type ChangeSigningKeyPasswordRequestType = {|
  publicDeriverId: number,
  oldPassword: string,
  newPassword: string,
|};
export async function changeSigningKeyPassword(request: ChangeSigningKeyPasswordRequestType): Promise<void> {
  await callBackground({ type: 'change-signing-password', request, });
}

export async function renamePublicDeriver(
  request: {| publicDeriverId: number, newName: string |}
): Promise<void> {
  await callBackground({ type: 'rename-public-deriver', request, });
}

export async function renameConceptualWallet(
  request: {| conceptualWalletId: number, newName: string |}
): Promise<void> {
  await callBackground({ type: 'rename-conceputal-wallet', request, });
}

// TODO: retire this API and replace with `signTransacton` and `broadcastTransaction`
export type SignAndBroadcastTransactionRequestType = {|
  publicDeriverId: number,
  senderUtxos: Array<CardanoAddressedUtxo>,
  unsignedTx: string,
  metadata: ?string,
  neededHashes: Array<string>,
  wits: Array<string>,
  password: string,
  txHash: string,
|};
type UserSignAndBroadcastTransactionRequestType = {|
  signRequest: HaskellShelleyTxSignRequest,
  password: string,
  publicDeriverId: number,
|};
type SignAndBroadcastTransactionReturnType = {| |}; // fixme
export async function signAndBroadcastTransaction(
  request: UserSignAndBroadcastTransactionRequestType
): Promise<{| txId: string |}> {
  const txBody = request.signRequest.unsignedTx.build();
  const txHash = RustModule.WalletV4.hash_transaction(txBody);

  const serializableRequest: SignAndBroadcastTransactionRequestType = {
    senderUtxos: request.signRequest.senderUtxos,
    unsignedTx: txBody.to_hex(),
    metadata: request.signRequest.metadata?.to_hex(),
    neededHashes: [...request.signRequest.neededStakingKeyHashes.neededHashes],
    wits: [...request.signRequest.neededStakingKeyHashes.wits],
    password: request.password,
    publicDeriverId: request.publicDeriverId,
    txHash: txHash.to_hex(),
  };
  txBody.free();
  txHash.free();
  const result = await callBackground({
    type: 'sign-and-broadcast-transaction',
    request: serializableRequest,
  });
  // fixme handle failures
  return result;
}

export type BroadcastTransactionRequestType = {|
  publicDeriverId: number,
  ...({|
    signedTxHexArray: Array<string>,
  |} | {|
    addressedUtxos?: Array<CardanoAddressedUtxo>,
    signedTxHex: string,
  |})
|};
export async function broadcastTransaction(request: BroadcastTransactionRequestType) {
  const result = await callBackground({ type: 'broadcast-transaction', request });
}

// Only mnemonic wallet has private staking key.
export async function getPrivateStakingKey(
  request: {| publicDeriverId: number, password: string |}
): Promise<?string> {
  return await callBackground({ type: 'get-private-staking-key', request });
}

export async function getCardanoAssets(
  request?: {| networkId: number, tokenIds: Array<string> |}
): Promise<Array<$ReadOnly<TokenRow>>> {
  return await callBackground({ type: 'get-cardano-assets', request, });
}

export type UpsertTxMemoRequestType = {|
  publicDeriverId: number,
  memo: TxMemoTableInsert | TxMemoTableRow,
|};
export async function upsertTxMemo(request: UpsertTxMemoRequestType): Promise<TxMemoTableRow> {
  return await callBackground({ type: 'upsert-tx-memo', request, });
}

export type DeleteTxMemoRequestType = {| publicDeriverId: number, key: TxMemoLookupKey, |};
export async function deleteTxMemo(request: DeleteTxMemoRequestType): Promise<void> {
  await callBackground({ type: 'delete-tx-memo', request, });
}

export async function getAllTxMemos(): Promise<Array<TxMemoTableRow>>{
  return await callBackground({ type: 'get-all-tx-memos' });
}

export async function removeAllTransactions(request: {| publicDeriverId: number |}): Promise<void> {
  await callBackground({ type: 'remove-all-transactions' });
}

export async function popAddress(request: { publicDeriverId: number, ... }): Promise<void> {
  await callBackground({ type: 'pop-address', request });
}

export type RefreshTransactionsRequestType = {|
  publicDeriverId: number,
  isLocalRequest: boolean,
  beforeTx?: ?ReferenceTransaction,
  afterTx?: ?ReferenceTransaction,
  skip?: number,
  limit?: number,
|};
// this is local refresh, i.e. load transactions from db, *not* syncing db with remote
export async function refreshTransactions(
  request: RefreshTransactionsRequestType
): Promise<Array<WalletTransaction>> {
  const txs = await callBackground({ type: 'refresh-transactions', request });
  return txs.map(tx => {
    // we know that there are only two types and only the Shelley one has the 'certificates'
    // field
    if (tx.hasOwnProperty('certificates')) {
      return CardanoShelleyTransaction.fromData(deserializeShelleyTransactionCtorData(tx));
    }
    return CardanoByronTransaction.fromData(deserializeByronTransactionCtorData(tx));
  });
}

export type ConnectorCreateAuthEntryRequestType = {|
  appAuthID: ?string,
  publicDeriverId: number,
  password: string,
|};
export async function connectorCreateAuthEntry(
  request: ConnectorCreateAuthEntryRequestType
): Promise<?WalletAuthEntry> {
  return await callBackground({ type: 'connector-create-auth-entry', request });
}

export async function getSelectedExplorer(): Promise<$ReadOnlyMap<number, {|
  backup: $ReadOnly<ExplorerRow>,
  selected: $ReadOnly<ExplorerRow>,
|}>> {
  return new Map(
    await callBackground({ type: 'get-selected-explorer' })
  );
}

export async function getAllExplorers(): Promise<
  $ReadOnlyMap<number, $ReadOnlyArray<$ReadOnly<ExplorerRow>>>
> {
  return new Map(
    await callBackground({ type: 'get-all-explorers' })
  );
}

export async function saveSelectedExplorer(request: {| explorer: $ReadOnly<ExplorerRow> |}): Promise<
  $ReadOnlyArray<$ReadOnly<PreferredExplorerRow>>
> {
  return await callBackground({ type: 'save-selected-explorer', request });
}

export type SignTransactionRequestType = {|
  publicDeriverId: number,
  password: string,
  transactionHex: string
|};
export async function signTransaction(request: SignTransactionRequestType): Promise<string> {
  return await callBackground({ type: 'sign-tx', request });
}

// Background -> UI notifications:
const callbacks = Object.freeze({
  walletStateUpdate: [],
  serverStatusUpdate: [],
});
chrome.runtime.onMessage.addListener(async (message, sender) => {
  console.log('get message from background:', JSON.stringify(message, null, 2));

  if (message.type === 'wallet-state-update') {
    callbacks.walletStateUpdate.forEach(callback => callback(message.params));
  } else if (message.type === 'server-status-update') {
    callbacks.serverStatusUpdate.forEach(callback => callback(message.params));
  }
});

export type WalletStateUpdateParams = {|
  eventType: 'update',
  publicDeriverId: number,
  isRefreshing: boolean,
|} | {|
  eventType: 'new',
  publicDeriverId: number,
|} | {|
  eventType: 'remove',
  publicDeriverId: number,
|};
export function listenForWalletStateUpdate(callback: (WalletStateUpdateParams) => Promise<void>) {
  callbacks.walletStateUpdate.push(callback);
}

export function listenForServerStatusUpdate(callback: (Array<ServerStatus>) => Promise<void>) {
  callbacks.serverStatusUpdate.push(callback);
}
