// @flow
import { sendToInjector, } from './utils';
import LocalStorageApi from '../../../../../app/api/localStorage';
import { isTrezorTWallet } from '../../../../../app/api/ada/lib/storage/models/ConceptualWallet/index';
import { getAllAddressesForWallet } from '../../../../../app/api/ada/lib/storage/bridge/traitUtils';
import { PublicDeriver, } from '../../../../../app/api/ada/lib/storage/models/PublicDeriver/index';
import { getDb } from '../../state';
import { loadWalletsFromStorage } from '../../../../../app/api/ada/lib/storage/models/load';

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
    debugger
  },
});

async function getCashbackWallet(): Promise<PublicDeriver<> | null> {
  const localStorageApi = new LocalStorageApi();
  // todo
  const selectedPublicDeriverId = await localStorageApi.getSelectedWalletId();

  const db = await getDb();
  const publicDerivers = await loadWalletsFromStorage(db);

  for (const publicDeriver of publicDerivers) {
    if (
      publicDeriver.getPublicDeriverId() === selectedPublicDeriverId &&
        !isTrezorTWallet(publicDeriver.getParent())
    ) {
      return publicDeriver;
    }
  }

  for (const publicDeriver of publicDerivers) {
    if (!isTrezorTWallet(publicDeriver.getParent())) {
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

  const result = await handler();
  sendRpcResponse(result, sender.tab.id, message.uid);
}
