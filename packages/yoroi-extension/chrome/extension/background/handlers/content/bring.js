// @flow
import LocalStorageApi from '../../../../../app/api/localStorage';
import { isAnyTrezorWallet } from '../../../../../app/api/ada/lib/storage/models/ConceptualWallet/index';
import { getAllAddressesForDisplay } from '../../../../../app/api/ada/lib/storage/bridge/traitUtils';
import { PublicDeriver, } from '../../../../../app/api/ada/lib/storage/models/PublicDeriver/index';
import { getDb } from '../../state';
import { loadWalletsFromStorage } from '../../../../../app/api/ada/lib/storage/models/load';
import { notifyAllTabsCashbackWalletChange } from '../yoroi/utils';
import { getBoundsForTabWindow, popupProps, sendToInjector } from './utils';
import { CoreAddressTypes } from '../../../../../app/api/ada/lib/storage/database/primitives/enums';
import { RustModule } from '../../../../../app/api/ada/lib/cardanoCrypto/rustLoader';
import { networks } from '../../../../../app/api/ada/lib/storage/database/prepackaged/networks';

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
    chrome.tabs.create({ url: 'main_window.html#/wallets/add' });
    return { ok: undefined };
  },

  'pop-up-cashback-wallet-selection': async (_: void, tabId: number) => {
    const bounds = await getBoundsForTabWindow(tabId);
    chrome.windows.create({
      ...popupProps,
      url: chrome.runtime.getURL('main_window_connector.html#/select-cashback-wallet'),
      left: (bounds.width + bounds.positionX) - popupProps.width,
      top: bounds.positionY + 80,
    });
    return { ok: undefined };
  },

  'get-address': async () => {
    const publicDeriver = await getCashbackWallet();
    if (!publicDeriver) {
      return { ok: publicDeriver };
    }
    const address = RustModule.WalletV4.Address.from_hex(
      (await getAllAddressesForDisplay({ publicDeriver, type: CoreAddressTypes.CARDANO_BASE }))[0].address
    );
    const result = address.to_bech32();
    address.free();
    return { ok: result };
  },

  'get-wallets': async () => {
    const db = await getDb();
    const publicDerivers = await loadWalletsFromStorage(db);
    const result = [];
    for (const publicDeriver of publicDerivers) {
      if (!isAnyTrezorWallet(publicDeriver.getParent())) {
        result.push({
          id: publicDeriver.getPublicDeriverId(),
          address: (await getAllAddressesForDisplay({ publicDeriver, type: CoreAddressTypes.CARDANO_BASE }))[0].address,
          name: (await publicDeriver.getParent().getFullConceptualWalletInfo()).Name
        });
      }
    }
    return { ok: result };
  },

  'set-cashback-wallet': async (id: number) => {
    // -1 is used when the user cancels the wallet selection. Bring expects a wallet change callback to be invoked.
    if (id !== -1) {
      const localStorageApi = new LocalStorageApi();
      await localStorageApi.saveCashbackWalletId(id);
    }
    notifyAllTabsCashbackWalletChange()
    return { ok: undefined };
  },
});

// return a wallet if either there is a saved cashback wallet or there is only one wallet
// return null if there is no wallet
// return undefines if there is no saved cashback wallet but there are multiple wallets
async function getCashbackWallet(): Promise<PublicDeriver<> | null | void> {
  const db = await getDb();
  const publicDerivers = (await loadWalletsFromStorage(db)).filter(publicDeriver =>
    !isAnyTrezorWallet(publicDeriver.getParent()) &&
      publicDeriver.getParent().getNetworkInfo().NetworkId === networks.CardanoMainnet.NetworkId
  );
  if (!publicDerivers.length) {
    return null;
  }

  // try to load saved cashback wallet
  const localStorageApi = new LocalStorageApi();
  const savedCashbackWalletId = await localStorageApi.getCashbackWalletId();
  const savedCashbackWallet = publicDerivers.find(publicDeriver =>
    publicDeriver.getPublicDeriverId() === savedCashbackWalletId
  );
  if (savedCashbackWallet) {
    return savedCashbackWallet;
  }

  // if there is one and only wallet use it as the cashback wallet
  if (publicDerivers.length === 1) {
    await localStorageApi.saveCashbackWalletId(publicDerivers[0].getPublicDeriverId());
    return publicDerivers[0];
  }

  return undefined;
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

  const result = await handler(message.params, sender.tab.id);
  sendRpcResponse(result, sender.tab.id, message.uid);
}
