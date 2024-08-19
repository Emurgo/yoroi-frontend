// @flow

import type { WalletState, ServerStatus } from '../../chrome/extension/background/types';
import { HaskellShelleyTxSignRequest } from './ada/transactions/shelley/HaskellShelleyTxSignRequest';
import { RustModule } from './ada/lib/cardanoCrypto/rustLoader';
import WalletTransaction from '../domain/WalletTransaction';
import type { WalletAuthEntry } from '../../chrome/extension/connector/types';
import CardanoShelleyTransaction, {
  deserializeTransactionCtorData as deserializeShelleyTransactionCtorData,
} from '../domain/CardanoShelleyTransaction';
import CardanoByronTransaction, {
  deserializeTransactionCtorData as deserializeByronTransactionCtorData,
} from '../domain/CardanoByronTransaction';
import { MultiToken } from './common/lib/MultiToken';
import type { ExplorerRow } from './ada/lib/storage/database/explorers/tables';
import {
  SendTransactionApiError,
  GenericApiError,
  IncorrectWalletPasswordError,
} from './common/errors';
import type { ResponseTicker } from './common/lib/state-fetch/types';
//import type { HandlerType } from '../../chrome/extension/background/handlers/yoroi/type';
import {
  GetHistoricalCoinPrices,
  RefreshCurrentCoinPrice
} from '../../chrome/extension/background/handlers/yoroi/coinPrice';
import {
  UpsertTxMemo,
  DeleteTxMemo,
  GetAllTxMemos,
} from '../../chrome/extension/background/handlers/yoroi/memo';
import {
  CreateWallet,
  CreateHardwareWallet,
  RemoveWallet,
  RenameConceptualWallet,
  RenamePublicDeriver,
  GetWallets,
  ResyncWallet,
  ChangeSigningPassword,
  GetPrivateStakingKey,
  RemoveAllTransactions,
  PopAddress,
  RefreshTransactions,
} from '../../chrome/extension/background/handlers/yoroi/wallet';
import {
  GetAllExplorers,
  GetSelectedExplorer,
  SaveSelectedExplorer,
} from '../../chrome/extension/background/handlers/yoroi/explorer';
import {
  GetCardanoAssets,
} from '../../chrome/extension/background/handlers/yoroi/token';
import {
  SignAndBroadcastTransaction,
  SignTransaction,
  BroadcastTransaction,
} from '../../chrome/extension/background/handlers/yoroi/transaction';
import type {
  SignAndBroadcastTransactionRequestType,
  BroadcastTransactionRequestType,
  SignTransactionRequestType,
} from '../../chrome/extension/background/handlers/yoroi/transaction';
import {
  UserConnectResponse,
  CreateAuthEntry,
  type ConnectorCreateAuthEntryRequestType,
  UserSignConfirm,
  UserSignReject,
  SignFail,
  SignWindowRetrieveData,
  ConnectWindowRetrieveData,
  RemoveWalletFromWhiteList,
  GetConnectedSites,
} from '../../chrome/extension/background/handlers/yoroi/connector';
import type {
  RemoveAllTransactionsRequest,
  RemoveAllTransactionsResponse,
} from './common';
import { Logger, stringifyError } from '../utils/logging';
import LocalizableError from '../i18n/LocalizableError';
import { WrongPassphraseError } from './ada/lib/cardanoCrypto/cryptoErrors';


export type { CreateHardwareWalletRequest } from '../../chrome/extension/background/handlers/yoroi/wallet';

/*
Neither this:

type _GetEntryFuncType = <RequestType, ResponseType, _T>(HandlerType<RequestType, ResponseType, _T>) => (
  (RequestType) => Promise<ResponseType>
);
type GetEntryFuncType<HandlerT> = $Call<_GetEntryFuncType, HandlerT>;

nor this:

type _GetRequestType = <RequestType, _R, _T>(HandlerType<RequestType, _R, _T>) => RequestType;
type _GetResponseType = <_R, ResponseType, _T>(HandlerType<_R, ResponseType, _T>) => ResponseType;
type GetEntryFuncType<HandlerT> = $Call<_GetRequestType, HandlerT> => Promise<$Call<_GetResponseType, HandlerT>>;
works as expected.
*/
type GetEntryFuncType<HandlerT> = $PropertyType<HandlerT, 'handle'>;

declare var chrome;


// UI -> background queries:

export function callBackground<T, R>(message: T): Promise<R> {
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
  const wallets = await callBackground({ type: GetWallets.typeTag, request: { walletId } });

  for (const wallet of wallets) {
    patchWalletState(wallet);
  }
  return wallets;
}

export async function subscribe(activeWalletId: ?number): Promise<void> {
  await callBackground({ type: 'subscribe', request: { activeWalletId } });
}

export const createWallet: GetEntryFuncType<typeof CreateWallet> = async (request) => {
  const resp = await callBackground({ type: CreateWallet.typeTag, request, });
  if (resp.error) {
    throw new Error(`error when creating wallet: ${resp.error}`);
  }
  return patchWalletState(resp);
}

export const createHardwareWallet: GetEntryFuncType<typeof CreateHardwareWallet> = async (request) => {
  const resp = await callBackground({ type: 'create-hardware-wallet', request, });
  if (resp.error) {
    throw new Error(`error when creating wallet: ${resp.error}`);
  }
  return patchWalletState(resp);
}

export const removeWalletFromDb: GetEntryFuncType<typeof RemoveWallet> = async (request) => {
  await callBackground({ type: RemoveWallet.typeTag, request, });
};

export const changeSigningKeyPassword: GetEntryFuncType<typeof ChangeSigningPassword> = async (request) => {
  await callBackground({ type: ChangeSigningPassword.typeTag, request, });
}

export const renamePublicDeriver: GetEntryFuncType<typeof RenamePublicDeriver> = async (request) => {
  await callBackground({ type: RenamePublicDeriver.typeTag, request, });
}

export const renameConceptualWallet: GetEntryFuncType<typeof RenameConceptualWallet> = async (request) => {
  await callBackground({ type: RenameConceptualWallet.typeTag, request, });
}

// TODO: retire this API and replace with `signTransacton` and `broadcastTransaction`
export async function signAndBroadcastTransaction(
  request: {|
    signRequest: HaskellShelleyTxSignRequest,
    password: string,
    publicDeriverId: number,
  |}
): Promise<{| txId: string |}> {
  const tx = request.signRequest.unsignedTx.build_tx();
  const txBody = tx.body();
  const txHash = RustModule.WalletV4.hash_transaction(txBody);

  const serializableRequest: SignAndBroadcastTransactionRequestType = {
    senderUtxos: request.signRequest.senderUtxos,
    unsignedTx: tx.to_hex(),
    metadata: request.signRequest.metadata?.to_hex(),
    neededHashes: [...request.signRequest.neededStakingKeyHashes.neededHashes],
    wits: [...request.signRequest.neededStakingKeyHashes.wits],
    password: request.password,
    publicDeriverId: request.publicDeriverId,
    txHash: txHash.to_hex(),
  };
  tx.free();
  txBody.free();
  txHash.free();
  const result = await callBackground({
    type: SignAndBroadcastTransaction.typeTag,
    request: serializableRequest,
  });
  return handleWrongPassword(result, IncorrectWalletPasswordError);
}

export async function broadcastTransaction(request: BroadcastTransactionRequestType): Promise<void> {
  const result = await callBackground({ type: BroadcastTransaction.typeTag, request });
  if (result.error) {
    throw new Error(result.error);
  }
  return result;
}

// Only mnemonic wallet has private staking key.
export async function getPrivateStakingKey(
  request: {| publicDeriverId: number, password: string |}
): Promise<string> {
  const result = await callBackground({ type: GetPrivateStakingKey.typeTag, request });
  return handleWrongPassword(result, WrongPassphraseError);
}

export const getCardanoAssets: GetEntryFuncType<typeof GetCardanoAssets> = async (request) => {
  return await callBackground({ type: GetCardanoAssets.typeTag, request, });
}

export const upsertTxMemo: GetEntryFuncType<typeof UpsertTxMemo> = async (request) => {
  return await callBackground({ type: UpsertTxMemo.typeTag, request, });
}
export const deleteTxMemo: GetEntryFuncType<typeof  DeleteTxMemo> = async (request) => {
  await callBackground({ type: DeleteTxMemo.typeTag, request, });
};
export const getAllTxMemos: GetEntryFuncType<typeof  GetAllTxMemos> = async () => {
  const result = await callBackground({ type: GetAllTxMemos.typeTag, });
  return result.map(GetAllTxMemos.fixMemoDate);
}

const _removeAllTransactions: GetEntryFuncType<typeof RemoveAllTransactions> = async (request) => {
  await callBackground({ type: RemoveAllTransactions.typeTag, request });
}

export async function removeAllTransactions(
  request: RemoveAllTransactionsRequest
): Promise<RemoveAllTransactionsResponse> {
  try {
    // 1) clear existing history
    await _removeAllTransactions({ publicDeriverId: request.publicDeriver.publicDeriverId });

    // 2) trigger a history sync
    try {
      await request.refreshWallet();
    } catch (_e) {
      Logger.warn(`${nameof(this.removeAllTransactions)} failed to connect to remote to resync. Data was still cleared locally`);
    }
  } catch (error) {
    Logger.error(`removeAllTransactions error: ` + stringifyError(error));
    if (error instanceof LocalizableError) throw error;
    throw new GenericApiError();
  }
}

export const popAddress: GetEntryFuncType<typeof PopAddress> = async (request) => {
  await callBackground({ type: PopAddress.typeTag, request });
}

function deserializeTx(tx: any): WalletTransaction {
  // we know that there are only two types and only the Shelley one has the 'certificates'
  // field
  if (Object.prototype.hasOwnProperty.call(tx, 'certificates')) {
    return CardanoShelleyTransaction.fromData(deserializeShelleyTransactionCtorData(tx));
  }
  return CardanoByronTransaction.fromData(deserializeByronTransactionCtorData(tx));
}

export const refreshTransactions: GetEntryFuncType<typeof RefreshTransactions> = async (request) => {
  const txs = await callBackground({ type: 'refresh-transactions', request });
  return txs.map(deserializeTx);
}

export const resyncWallet: GetEntryFuncType<typeof ResyncWallet> = async (request) => {
  await callBackground({ type: 'resync-wallet', request });
}

export async function connectorCreateAuthEntry(
  request: ConnectorCreateAuthEntryRequestType
): Promise<?WalletAuthEntry> {
  const result = await callBackground({ type: CreateAuthEntry.typeTag, request });
  return handleWrongPassword(result, WrongPassphraseError);
}

export async function getSelectedExplorer(): Promise<$ReadOnlyMap<number, {|
  backup: $ReadOnly<ExplorerRow>,
  selected: $ReadOnly<ExplorerRow>,
|}>> {
  return new Map(
    await callBackground({ type: GetSelectedExplorer.typeTag })
  );
}

export async function getAllExplorers(): Promise<
  $ReadOnlyMap<number, $ReadOnlyArray<$ReadOnly<ExplorerRow>>>
> {
  return new Map(
    await callBackground({ type: GetAllExplorers.typeTag })
  );
}

export const saveSelectedExplorer: GetEntryFuncType<typeof SaveSelectedExplorer> = async (request) => {
  return await callBackground({ type: SaveSelectedExplorer.typeTag, request });
}

export async function signTransaction(request: SignTransactionRequestType): Promise<string> {
  const result = await callBackground({ type: SignTransaction.typeTag, request });
  return handleWrongPassword(result, IncorrectWalletPasswordError);
}

export const getHistoricalCoinPrices: GetEntryFuncType<typeof GetHistoricalCoinPrices> = async (request) => {
  return await callBackground({ type: GetHistoricalCoinPrices.typeTag, request });
}

export const refreshCurrentCoinPrice: GetEntryFuncType<typeof RefreshCurrentCoinPrice> = async () => {
  await callBackground({ type: RefreshCurrentCoinPrice.typeTag, });
}

export const userConnectResponse: GetEntryFuncType<typeof UserConnectResponse> = async (request) => {
  await callBackground({ type: UserConnectResponse.typeTag, request });
}

export const userSignConfirm: GetEntryFuncType<typeof UserSignConfirm> = async (request) => {
  await callBackground({ type: UserSignConfirm.typeTag, request });
}

export const userSignReject: GetEntryFuncType<typeof UserSignReject> = async (request) => {
  await callBackground({ type: UserSignReject.typeTag, request });
}

export const signFail: GetEntryFuncType<typeof SignFail> = async (request) => {
  await callBackground({ type: SignFail.typeTag, request });
}

export const signWindowRetrieveData: GetEntryFuncType<typeof SignWindowRetrieveData> = async () => {
  return await callBackground({ type: SignWindowRetrieveData.typeTag });
}

export const connectWindowRetrieveData: GetEntryFuncType<typeof ConnectWindowRetrieveData> = async () => {
  return await callBackground({ type: ConnectWindowRetrieveData.typeTag });
}

export const removeWalletFromWhiteList: GetEntryFuncType<typeof RemoveWalletFromWhiteList> = async (request) => {
  await callBackground({ type: RemoveWalletFromWhiteList.typeTag, request });
}

export const getConnectedSites: GetEntryFuncType<typeof GetConnectedSites> = async () => {
  return await callBackground({ type: GetConnectedSites.typeTag });
}

// Background -> UI notifications:
const callbacks = Object.freeze({
  walletStateUpdate: [],
  serverStatusUpdate: [],
  coinPriceUpdate: [],
});
chrome.runtime.onMessage.addListener(async (message, _sender, _sendResponse) => {
  //fixme: verify sender.id/origin
  Logger.debug('get message from background:', JSON.stringify(message, null, 2));

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

function handleWrongPassword<
  T: { error?: string, ... }
>(
  result: T,
  passwordErrorClass: typeof Error
): T {
  if (result.error === 'IncorrectWalletPasswordError') {
    throw new passwordErrorClass();
  }
  if (result.error) {
    throw new SendTransactionApiError();
  }
  return result;
}
