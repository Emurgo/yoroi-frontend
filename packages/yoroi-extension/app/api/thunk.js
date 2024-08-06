// @flow

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
import { WrongPassphraseError } from './ada/lib/cardanoCrypto/cryptoErrors';
import type { ResponseTicker } from './common/lib/state-fetch/types';
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
  await callBackground({ type: 'rename-conceptual-wallet', request, });
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
  return handleWrongPassword(result);
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
export async function broadcastTransaction(request: BroadcastTransactionRequestType): Promise<void> {
  await callBackground({ type: 'broadcast-transaction', request });
}

// Only mnemonic wallet has private staking key.
export async function getPrivateStakingKey(
  request: {| publicDeriverId: number, password: string |}
): Promise<?string> {
  const result = await callBackground({ type: 'get-private-staking-key', request });
  return handleWrongPassword(result);
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
  const result = await callBackground({ type: 'get-all-tx-memos' });
  return result.map(fixMemoDate);
}

export async function removeAllTransactions(request: {| publicDeriverId: number |}): Promise<void> {
  await callBackground({ type: 'remove-all-transactions', request });
}

export async function popAddress(request: { publicDeriverId: number, ... }): Promise<void> {
  await callBackground({ type: 'pop-address', request });
}

type RefreshTransactionForInitialLoad = {|
|};
type RefreshTransactionToLoadMore = {|
  beforeTx: ReferenceTransaction,
  skip: number,
  limit: number,
|};
export type RefreshTransactionsRequestType = {|
  publicDeriverId: number,
  ...(RefreshTransactionForInitialLoad | RefreshTransactionToLoadMore)
|};

function deserializeTx(tx: any): WalletTransaction {
  // we know that there are only two types and only the Shelley one has the 'certificates'
  // field
  if (Object.prototype.hasOwnProperty.call(tx, 'certificates')) {
    return CardanoShelleyTransaction.fromData(deserializeShelleyTransactionCtorData(tx));
  }
  return CardanoByronTransaction.fromData(deserializeByronTransactionCtorData(tx));
}

export async function refreshTransactions(
  request: RefreshTransactionsRequestType
): Promise<Array<WalletTransaction>> {
  const txs = await callBackground({ type: 'refresh-transactions', request });
  return txs.map(deserializeTx);
}

export async function resyncWallet(
  request: {| publicDeriverId: number |}
): Promise<void> {
  return callBackground({ type: 'resync-wallet', request });
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
  const result = await callBackground({ type: 'sign-tx', request });
  return handleWrongPassword(result);
}

export type HistoricalCoinPricesRequest = {|
  from: string,
  timestamps: Array<number>,
|};
export type HistoricalCoinPriceResponse = Array<$ReadOnly<{|
  From: string,
  To: string,
  Time: Date,
  Price: number,
|}>>;
export async function getHistoricalCoinPrices(
  request: HistoricalCoinPricesRequest
): Promise<HistoricalCoinPriceResponse> {
  return await callBackground({ type: 'get-historical-coin-prices', request });
}

export function refreshCurrentCoinPrice(): void {
  callBackground({ type: 'refresh-current-coin-price' }).catch(error => {
    console.error('error refreshing current coin price:', error.message)
  });
}

// Background -> UI notifications:
const callbacks = Object.freeze({
  walletStateUpdate: [],
  serverStatusUpdate: [],
  coinPriceUpdate: [],
});
chrome.runtime.onMessage.addListener(async (message, _sender, _sendResponse) => {
  //fixme: verify sender.id/origin
  console.log('get message from background:', JSON.stringify(message, null, 2));

  if (message.type === 'wallet-state-update') {
    if (message.params.newTxs) {
      message.params.newTxs = message.params.newTxs.map(deserializeTx);
    }
    if (message.params.walletState) {
      patchWalletState(message.params.walletState);
    }
    callbacks.walletStateUpdate.forEach(callback => callback(message.params));
  } else if (message.type === 'server-status-update') {
    callbacks.serverStatusUpdate.forEach(callback => callback(message.params));
  } else if (message.type === 'coin-price-update') {
    callbacks.coinPriceUpdate.forEach(callback => callback(message.params));
  }
});

type Update = {|
  isRefreshing: true,
|} | {|
  isRefreshing: false,
  walletState: WalletState,
  newTxs: Array<WalletTransaction>,
|};
type WalletStateUpdateParams = {|
  eventType: 'update',
  publicDeriverId: number,
  ...Update,
|} | {|
  // in case we have multiple UI tabs and one tab creates a new wallet, this message notifies other tabs
  eventType: 'new',
  publicDeriverId: number,
|} | {|
  eventType: 'remove',
  publicDeriverId: number,
|};

type CoinPriceUpdateParams = {|
  ticker: ResponseTicker,
|};

export function listenForWalletStateUpdate(callback: (WalletStateUpdateParams) => Promise<void>): void {
  callbacks.walletStateUpdate.push(callback);
}

export function listenForServerStatusUpdate(callback: (Array<ServerStatus>) => Promise<void>): void {
  callbacks.serverStatusUpdate.push(callback);
}

export function listenForCoinPriceUpdate(callback: (CoinPriceUpdateParams) => void): void {
  callbacks.coinPriceUpdate.push(callback);
}

function handleWrongPassword<T: { error?: string, ... }>(result: T): T {
  if (result.error === 'IncorrectWalletPasswordError') {
    throw new WrongPassphraseError();
  }
  if (result.error) {
    throw new Error(result.error);
  }
  return result;
}

export function fixMemoDate(memo: TxMemoTableInsert | TxMemoTableRow): TxMemoTableInsert | TxMemoTableRow {
  memo.LastUpdated = new Date(memo.LastUpdated);
  return memo;
}
