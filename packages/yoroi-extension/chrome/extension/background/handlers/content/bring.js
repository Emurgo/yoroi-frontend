// @flow
import { sendToInjector, } from './utils';
import LocalStorageApi from '../../../../../app/api/localStorage';
import { isTrezorTWallet } from '../../../../../app/api/ada/lib/storage/models/ConceptualWallet/index';
import { getAllAddressesForWallet } from '../../../../../app/api/ada/lib/storage/bridge/traitUtils';
import { PublicDeriver, } from '../../../../../app/api/ada/lib/storage/models/PublicDeriver/index';
import { getDb } from '../../state';
import { loadWalletsFromStorage } from '../../../../../app/api/ada/lib/storage/models/load';
import { notifyAllTabsCashbackWalletChange } from '../yoroi/utils';

declare var chrome;

const handlers = Object.freeze({
  'get-theme-mode': async () => {
    const localStorageApi = new LocalStorageApi();
    let theme = await localStorageApi.getUserThemeMode();
    if (theme !== 'light' && theme !== 'dark') {
      theme = 'light';
    }
    return { ok: theme };
  },

  'pop-up-wallet-creation': async () => {
    chrome.tabs.create({ url: 'main_window.html' });
    return { ok: undefined };
  },

  'get-address': async () => {
    const publicDeriver = await getCashbackWallet();
    if (!publicDeriver) {
      return;
    }
    const result = (await getAllAddressesForWallet(publicDeriver)).accountingAddresses[0];
    return { ok: result.address.Hash };
  },

  'get-wallets': async () => {
    const db = await getDb();
    const publicDerivers = await loadWalletsFromStorage(db);
    const result = [];
    for (const publicDeriver of publicDerivers) {
      if (!isTrezorTWallet(publicDeriver.getParent())) {
        result.push({
          id: publicDeriver.getPublicDeriverId(),
          address: (await getAllAddressesForWallet(publicDeriver)).accountingAddresses[0].address.Hash,
          name: (await publicDeriver.getParent().getFullConceptualWalletInfo()).Name
        });
      }
    }
    return { ok: result };
  },

  'set-cashback-wallet': async (id: number) => {
    const localStorageApi = new LocalStorageApi();
    await localStorageApi.saveCashbackWalletId(id);
    notifyAllTabsCashbackWalletChange(id);
    return { ok: undefined };
  },
});

async function getCashbackWallet(): Promise<PublicDeriver<> | null> {
  const db = await getDb();
  const publicDerivers = await loadWalletsFromStorage(db);
  const localStorageApi = new LocalStorageApi();
  // try to load saved cashback wallet
  const savedCashbackWalletId = await localStorageApi.getCashbackWalletId();
  for (const publicDeriver of publicDerivers) {
    if (
      publicDeriver.getPublicDeriverId() === savedCashbackWalletId &&
        !isTrezorTWallet(publicDeriver.getParent())
    ) {
      return publicDeriver;
    }
  }

  // default to the selected wallet
  const selectedPublicDeriverId = await localStorageApi.getSelectedWalletId();
  for (const publicDeriver of publicDerivers) {
    if (
      publicDeriver.getPublicDeriverId() === selectedPublicDeriverId &&
        !isTrezorTWallet(publicDeriver.getParent())
    ) {
      await localStorageApi.saveCashbackWalletId(publicDeriver.getPublicDeriverId());
      return publicDeriver;
    }
  }

  // selected wallet is a Trezor wallet, fall back to the first non-Trezor wallet
  for (const publicDeriver of publicDerivers) {
    if (!isTrezorTWallet(publicDeriver.getParent())) {
      await localStorageApi.saveCashbackWalletId(publicDeriver.getPublicDeriverId());
      return publicDeriver;
    }
  }

  return null;
}

function sendRpcResponse(response: Object, tabId: number, messageUid: number) {
  sendToInjector(
    tabId,
    {
      type: 'bring_rpc_response',
      uid: messageUid,
      return: response,
    }
  );
}

export async function handleBringRpc(message: Object, sender: Object) {
  const handler = handlers[message.function];
  
  if (!handler) {
    throw new Error('missing Bring handler for ' + message.function);
  }

  const result = await handler(message.params);
  sendRpcResponse(result, sender.tab.id, message.uid);
}
