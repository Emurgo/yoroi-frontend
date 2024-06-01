// @flow

import { schema } from 'lovefield';
import { loadLovefieldDBFromDump } from './ada/lib/storage/database';
import type { lf$Database, } from 'lovefield';
import type { WalletState } from '../../chrome/extension/background/types';
import { HaskellShelleyTxSignRequest } from './ada/transactions/shelley/HaskellShelleyTxSignRequest';
import type { NetworkRow, TokenRow } from './ada/lib/storage/database/primitives/tables';
import type { TxMemoLookupKey, } from './ada/lib/storage/bridge/memos';
import type { TxMemoTableInsert, TxMemoTableRow, } from './ada/lib/storage/database/memos/tables';
import { RustModule } from './ada/lib/cardanoCrypto/rustLoader';
import type { CardanoAddressedUtxo } from './ada/transactions/types';
import type { HWFeatures, } from './ada/lib/storage/database/walletTypes/core/tables';

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

export async function getWallets(): Promise<Array<WalletState>> {
  return await callBackground({ type: 'get-wallets' });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  //fixme: verify sender.id/origin
});

export async function subscribeWalletStateChanges(): Promise<Array<WalletState>> {
  return await callBackground({ type: 'subscribe-wallet-state-changes' });
}

export type CreateWalletRequestType = {|
  networkId: number,
  recoveryPhrase: string,
  walletName: string,
  walletPassword: string,
  accountIndex: number,
|};

export async function createWallet(request: CreateWalletRequestType): Promise<WalletState> {
  return await callBackground({ type: 'create-wallet', request, });
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
  return await callBackground({ type: 'create-hardware-wallet', request, });
}

export async function removeWalletFromDb(request: {| publicDeriverId: number |}): Promise<void> {
  await callBackground({ type: 'remove-wallet', request, });
}

type ChangeSigningKeyPasswordRequestType = {|
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

type UserSignAndBroadcastRequestType = {|
  signRequest: HaskellShelleyTxSignRequest,
  password: string,
  publicDeriverId: number,
|};
export type SignAndBroadcastRequestType = {|
  publicDeriverId: number,
  senderUtxos: Array<CardanoAddressedUtxo>,
  unsignedTx: string,
  metadata: ?string,
  wits: Array<string>,
  password: string,
  txHash: string,
|};
export async function signAndBroadcast(request: UserSignAndBroadcastRequestType): Promise<{| txId: string |}> {
  const txBody = request.signRequest.unsignedTx.build();
  const txHash = RustModule.WalletV4.hash_transaction(txBody);

  const serializableRequest: SignAndBroadcastRequestType = {
    senderUtxos: request.signRequest.senderUtxos,
    unsignedTx: txBody.to_hex(),
    metadata: request.signRequest.metadata?.to_hex(),
    wits: [...request.signRequest.neededStakingKeyHashes.wits],
    password: request.password,
    publicDeriverId: request.publicDeriverId,
    txHash: txHash.to_hex(),
  };
  txBody.free();
  txHash.free();
  return await callBackground({ type: 'sign-and-broadcast', serializableRequest, });
}

// Only mnemonic wallet has private staking key.
export async function getPrivateStakingKey(
  request: {| publicDeriverId: number, password: string |}
): Promise<?string> {
  return await callBackground({ type: 'get-private-staking-key', request });
}

export async function getCardanoAssets(
  request: {| networkId: number, tokenIds: Array<string> |}
): Promise<Array<$ReadOnly<TokenRow>>> {
  return await callBackground({ type: 'get-cardano-assets', request, });
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

export async function getAllTxMemos(): Promise<Array<TxMemoTableRow>>{
  return await callBackground({ type: 'get-all-tx-memos' });
}

export async function removeAllTransactions(request: {| publicDeriverId: number |}): Promise<void> {
  await callBackground({ type: 'remove-all-transactions' });
}

export async function popAddress(request: { publicDeriverId: number, ... }): Promise<void> {
  await callBackground({ type: 'pop-address', request });
}
