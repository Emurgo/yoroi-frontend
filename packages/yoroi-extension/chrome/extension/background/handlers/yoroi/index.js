// @flow
import { GetHistoricalCoinPrices, RefreshCurrentCoinPrice } from './coinPrice';
import {
  UpsertTxMemo,
  DeleteTxMemo,
  GetAllTxMemos,
} from './memo';
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
} from './wallet';
import {
  GetAllExplorers,
  GetSelectedExplorer,
  SaveSelectedExplorer,
} from './explorer';
import {
  SignTransaction,
  SignAndBroadcastTransaction,
  BroadcastTransaction,
} from './transaction';
import { GetCardanoAssets } from './token';
import {
  UserConnectResponse,
  CreateAuthEntry,
  UserSignConfirm,
  UserSignReject,
  SignFail,
  SignWindowRetrieveData,
  ConnectWindowRetrieveData,
  RemoveWalletFromWhiteList,
  GetConnectedSites,
} from './connector';
import { subscribe } from '../../subscriptionManager';

const handlerMap = Object.freeze({
  [GetHistoricalCoinPrices.typeTag]: GetHistoricalCoinPrices.handle,
  [RefreshCurrentCoinPrice.typeTag]: RefreshCurrentCoinPrice.handle,

  [UpsertTxMemo.typeTag]: UpsertTxMemo.handle,
  [DeleteTxMemo.typeTag]: DeleteTxMemo.handle,
  [GetAllTxMemos.typeTag]: GetAllTxMemos.handle,

  [CreateWallet.typeTag]: CreateWallet.handle,
  [CreateHardwareWallet.typeTag]: CreateHardwareWallet.handle,
  [RemoveWallet.typeTag]: RemoveWallet.handle,
  [RenameConceptualWallet.typeTag]: RenameConceptualWallet.handle,
  [RenamePublicDeriver.typeTag]: RenamePublicDeriver.handle,
  [GetWallets.typeTag]: GetWallets.handle,
  [ResyncWallet.typeTag]: ResyncWallet.handle,
  [ChangeSigningPassword.typeTag]: ChangeSigningPassword.handle,
  [GetPrivateStakingKey.typeTag]: GetPrivateStakingKey.handle,
  [RemoveAllTransactions.typeTag]: RemoveAllTransactions.handle,
  [PopAddress.typeTag]: PopAddress.handle,
  [RefreshTransactions.typeTag]: RefreshTransactions.handle,

  [GetAllExplorers.typeTag]: GetAllExplorers.handle,
  [GetSelectedExplorer.typeTag]: GetSelectedExplorer.handle,
  [SaveSelectedExplorer.typeTag]: SaveSelectedExplorer.handle,

  [SignTransaction.typeTag]: SignTransaction.handle,
  [SignAndBroadcastTransaction.typeTag]: SignAndBroadcastTransaction.handle,
  [BroadcastTransaction.typeTag]: BroadcastTransaction.handle,

  [GetCardanoAssets.typeTag]: GetCardanoAssets.handle,

  [UserConnectResponse.typeTag]: UserConnectResponse.handle,
  [CreateAuthEntry.typeTag]: CreateAuthEntry.handle,
  [UserSignConfirm.typeTag]: UserSignConfirm.handle,
  [UserSignReject.typeTag]: UserSignReject.handle,
  [SignFail.typeTag]: SignFail.handle,
  [SignWindowRetrieveData.typeTag]: SignWindowRetrieveData.handle,
  [ConnectWindowRetrieveData.typeTag]: ConnectWindowRetrieveData.handle,
  [RemoveWalletFromWhiteList.typeTag]: RemoveWalletFromWhiteList.handle,
  [GetConnectedSites.typeTag]: GetConnectedSites.handle,
});

type Handler = (
  request: Object,
  sender: Object,
  sendResponse: Function,
) => Promise<void>;

export function getHandler(typeTag: string): ?Handler {
  if (typeTag === 'subscribe') {
    return async (request, sender, sendResponse) => {
      subscribe(sender.tab.id, request.request.activeWalletId);
      if (request.request.changed) {
        // notify content scripts in all tabs
        chrome.tabs.query({}, (tabs) => {
          for (const tab of tabs) {
            chrome.tabs.sendMessage(
              tab.id,
              {
                type: 'active-wallet-open',
                activeWalletId: request.request.activeWalletId
              }
            );
          }
        });
      }
      sendResponse(undefined);
    };
  }

  const handler = handlerMap[typeTag];
  if (handler) {
    return async (request, send, sendResponse) => {
      try {
        const result = await handler(request.request);
        sendResponse(result);
      } catch (error) {
        sendResponse({ error: error.message });
      }
    }
  }
  return undefined;
}

