/* eslint-disable promise/always-return */
// @flow
import { observable, action, runInAction, computed } from 'mobx';
import Request from './lib/LocalizedRequest';
import Store from './base/Store';
import type {
  PublicDeriverCache,
  ConnectingMessage,
  WhitelistEntry,
  ConnectedSites,
  ConnectRetrieveData,
  RemoveWalletFromWhitelistData,
  GetConnectedSitesData,
  Protocol,
} from '../../chrome/extension/ergo-connector/types';
import type { ActionsMap } from '../actions/index';
import type { StoresMap } from './index';
import { LoadingWalletStates } from '../ergo-connector/types';
import {
  getWallets
} from '../api/common/index';
import {
  isCardanoHaskell,
  isErgo,
} from '../api/ada/lib/storage/database/prepackaged/networks';
import {
  asGetBalance,
  asGetPublicKey,
} from '../api/ada/lib/storage/models/PublicDeriver/traits';
import { Bip44Wallet } from '../api/ada/lib/storage/models/Bip44Wallet/wrapper';
import { walletChecksum, legacyWalletChecksum } from '@emurgo/cip4-js';
import type { WalletChecksum } from '@emurgo/cip4-js';
import { MultiToken } from '../api/common/lib/MultiToken';
import { PublicDeriver } from '../api/ada/lib/storage/models/PublicDeriver/index';

// Need to run only once - Connecting wallets
let initedConnecting = false;
function sendMsgConnect(): Promise<ConnectingMessage> {
  return new Promise((resolve, reject) => {
    if (!initedConnecting)
      window.chrome.runtime.sendMessage((
        { type: 'connect_retrieve_data' }: ConnectRetrieveData),
        response => {
          if (window.chrome.runtime.lastError) {
            // eslint-disable-next-line prefer-promise-reject-errors
            reject('Could not establish connection: connect_retrieve_data ');
          }

          resolve(response);
          initedConnecting = true;
        }
      );
  });
}


function getProtocol(): Promise<Protocol> {
  return new Promise((resolve, reject) => {
      window.chrome.runtime.sendMessage(
        ({ type: 'get_protocol' }),
        response => {
          if (window.chrome.runtime.lastError) {
            // eslint-disable-next-line prefer-promise-reject-errors
            reject('Could not establish connection: get_protocol ');
          }

          resolve(response);
        }
      );
  });
}

function getConnectedSites(): Promise<ConnectedSites> {
  return new Promise((resolve, reject) => {
    window.chrome.runtime.sendMessage(
      ({ type: 'get_connected_sites' }: GetConnectedSitesData),
      response => {
        if (window.chrome.runtime.lastError) {
          // eslint-disable-next-line prefer-promise-reject-errors
          reject('Could not establish connection: get_connected_sites ');
        }

        resolve(response);
      }
    );
  });
}

async function parseWalletsList(
  wallets: Array<PublicDeriver<>>
  ): Promise<Array<PublicDeriverCache>> {
  const result = [];
  for (const currentWallet of wallets) {
    const conceptualInfo = await currentWallet.getParent().getFullConceptualWalletInfo();
    const withPubKey = asGetPublicKey(currentWallet);

    const canGetBalance = asGetBalance(currentWallet);
    const balance = canGetBalance == null
      ? new MultiToken([], currentWallet.getParent().getDefaultToken())
      : await canGetBalance.getBalance();
    result.push({
      publicDeriver: currentWallet,
      name: conceptualInfo.Name,
      balance,
      checksum: await getChecksum(withPubKey)
    });
  }

  return result
}

type GetWhitelistFunc = void => Promise<?Array<WhitelistEntry>>;
type SetWhitelistFunc = {|
  whitelist: Array<WhitelistEntry> | void,
|} => Promise<void>;

export default class ConnectorStore extends Store<StoresMap, ActionsMap> {
  @observable connectingMessage: ?ConnectingMessage = null;
  @observable whiteList: Array<WhitelistEntry> = [];

  @observable loadingWallets: $Values<typeof LoadingWalletStates> = LoadingWalletStates.IDLE;
  @observable errorWallets: string = '';
  /**
   * - `filteredWallets`: includes only cardano or ergo wallets according to the `protocol`
   *   it will be displyed to the user at the `connect` screen for the user to choose
   *   which wallet to connect
   * - `allWallets`: list of all wallets the user have in yoroi
   *    Will be displayed in the on the `connected webists screen` as we need all wallets
   *    not only ergo or cardano ones
   */
  @observable filteredWallets: Array<PublicDeriverCache> = [];
  @observable allWallets: Array<PublicDeriverCache> = [];

  @observable getConnectorWhitelist: Request<
    GetWhitelistFunc
  > = new Request<GetWhitelistFunc>(
    this.api.localStorage.getWhitelist
  );
  @observable setConnectorWhitelist: Request<SetWhitelistFunc> = new Request<
    SetWhitelistFunc
  >(({ whitelist }) => this.api.localStorage.setWhitelist(whitelist));

  @observable getConnectedSites: Request<
    typeof getConnectedSites
  > = new Request<typeof getConnectedSites>(
    getConnectedSites
  );


  setup(): void {
    super.setup();
    this.actions.connector.getConnectorWhitelist.listen(this._getConnectorWhitelist);
    this.actions.connector.updateConnectorWhitelist.listen(this._updateConnectorWhitelist);
    this.actions.connector.removeWalletFromWhitelist.listen(this._removeWalletFromWhitelist);
    this.actions.connector.refreshActiveSites.listen(this._refreshActiveSites);
    this.actions.connector.refreshWallets.listen(this._getWallets);
    this._getConnectorWhitelist();
    this.currentConnectorWhitelist;
  }

  teardown(): void {
    super.teardown();
  }

  // ========== connecting wallets ========== //
  @action
  _getConnectingMsg: () => Promise<void> = async () => {
    await sendMsgConnect()
      .then(response => {
        runInAction(() => {
          this.connectingMessage = response;
        });
      })
      // eslint-disable-next-line no-console
      .catch(err => console.error(err));
  };

  // ========== wallets info ========== //
  @action
  _getWallets: void => Promise<void> = async () => {
    runInAction(() => {
      this.loadingWallets = LoadingWalletStates.PENDING;
      this.errorWallets = '';
    });

    const persistentDb = this.stores.loading.getDatabase();
    if (persistentDb == null) {
      throw new Error(`${nameof(this._getWallets)} db not loaded. Should never happen`);
    }
    try {
      const wallets = await getWallets({ db: persistentDb });

      const protocol = await getProtocol().then(res => res);
      const isProtocolErgo = protocol.type === 'ergo';
      const isProtocolCardano = protocol.type === 'cardano';
      const isProtocolDefined = isProtocolErgo || isProtocolCardano;
      const protocolFilter = wallet => {
        const isWalletErgo = isErgo(wallet.getParent().getNetworkInfo());
        return isProtocolErgo === isWalletErgo;
      };
      const filteredWallets = isProtocolDefined
        ? wallets.filter(protocolFilter)
        : wallets;

      const filteredWalletsResult = await parseWalletsList(filteredWallets)
      const allWallets = await parseWalletsList(wallets)

      runInAction(() => {
        this.loadingWallets = LoadingWalletStates.SUCCESS;

        // note: "replace" is a mobx-specific function
        (this.filteredWallets: any).replace(filteredWalletsResult);
        (this.allWallets: any).replace(allWallets);
      });
    } catch (err) {
      runInAction(() => {
        this.loadingWallets = LoadingWalletStates.REJECTED;
        this.errorWallets = err.message;
      });
    }
  };

  // ========== whitelist ========== //
  @computed get currentConnectorWhitelist(): Array<WhitelistEntry> {
    let { result } = this.getConnectorWhitelist;
    if (result == null) {
      result = this.getConnectorWhitelist.execute().result;
    }
    return result ?? [];
  }
  _getConnectorWhitelist: void => Promise<void> = async () => {
    await this.getConnectorWhitelist.execute();
  };
  _updateConnectorWhitelist: ({| whitelist: Array<WhitelistEntry> |}) => Promise<void> = async ({
    whitelist,
  }) => {
    await this.setConnectorWhitelist.execute({ whitelist });
    await this.getConnectorWhitelist.execute();
  };
  _removeWalletFromWhitelist: (url: string) => Promise<void> = async url => {
    const filter = this.currentConnectorWhitelist.filter(e => e.url !== url);
    await this.setConnectorWhitelist.execute({
      whitelist: filter,
    });
    await this.getConnectorWhitelist.execute();
    window.chrome.runtime.sendMessage(({
      type: 'remove_wallet_from_whitelist',
      url,
    }: RemoveWalletFromWhitelistData));
  };

  _refreshActiveSites: void => Promise<void> = async () => {
    await this.getConnectedSites.execute();
  }

  // ========== active websites ========== //
  @computed get activeSites(): ConnectedSites {
    let { result } = this.getConnectedSites;
    if (result == null) {
      result = this.getConnectedSites.execute().result;
    }
    return result ?? { sites: [] };
  }
}

// TODO: do something better than duplicating the logic here
async function getChecksum(
  publicDeriver: ReturnType<typeof asGetPublicKey>,
): Promise<void | WalletChecksum> {
  if (publicDeriver == null) return undefined;

  const hash = (await publicDeriver.getPublicKey()).Hash;

  const isLegacyWallet =
    isCardanoHaskell(publicDeriver.getParent().getNetworkInfo()) &&
    publicDeriver.getParent() instanceof Bip44Wallet;
  const checksum = isLegacyWallet
    ? legacyWalletChecksum(hash)
    : walletChecksum(hash);

  return checksum;
}
