/* eslint-disable promise/always-return */
// @flow
import { observable, action, runInAction, computed } from 'mobx';
import { getWalletsInfo } from '../../../chrome/extension/background';
import Request from '../../stores/lib/LocalizedRequest';
import Store from './base/Store';

// Need to run only once - Connecting wallets
let initedConnecting = false;
function sendMsgConnect() {
  return new Promise((resolve, reject) => {
    if (!initedConnecting)
      window.chrome.runtime.sendMessage({ type: 'connect_retrieve_data' }, response => {
        if (window.chrome.runtime.lastError) {
          // eslint-disable-next-line prefer-promise-reject-errors
          reject('Could not establish connection: connect_retrieve_data ');
        }

        resolve(response);
        initedConnecting = true;
      });
  });
}

// Need to run only once - Sign Tx Confirmation
let initedSigning = false;
function sendMsgSigningTx() {
  return new Promise((resolve, reject) => {
    if (!initedSigning)
      window.chrome.runtime.sendMessage({ type: 'tx_sign_window_retrieve_data' }, response => {
        if (window.chrome.runtime.lastError) {
          // eslint-disable-next-line prefer-promise-reject-errors
          reject('Could not establish connection: connect_retrieve_data ');
        }

        resolve(response);
        initedSigning = true;
      });
  });
}

export default class ConnectorStore extends Store {
  @observable connectingMessage: ?{| tabId: number, url: string |} = null;
  @observable whiteList: Array<any> = [];

  @observable loadingWallets: 'idle' | 'pending' | 'success' | 'rejected' = 'idle';
  @observable errorWallets: string = '';
  @observable wallets: Array<any> = [];

  @observable getConnectorWhitelist: Request<
    (void) => Promise<?Array<{| url: string, walletIndex: number |}>>
  > = new Request<(void) => Promise<?Array<{| url: string, walletIndex: number |}>>>(
    this.api.localStorage.getWhitelist
  );
  @observable setConnectorWhitelist: Request<(Array<any> | void) => Promise<void>> = new Request<
    (Array<any> | void) => Promise<void>
  >(this.api.localStorage.setWhitelist);

  @observable signingMessage: ?{| sign: Object, tabId: number |} = null;

  setup(): void {
    super.setup();
    this.actions.connector.getResponse.listen(this._getConnectingMsg);
    this.actions.connector.getConnectorWhitelist.listen(this._getConnectorWhitelist);
    this.actions.connector.removeWalletFromWhitelist.listen(this._removeWalletFromWhitelist);
    this.actions.connector.confirmSignInTx.listen(this._confirmSignInTx);
    this.actions.connector.cancelSignInTx.listen(this._cancelSignInTx);
    this.actions.connector.getSigningMsg.listen(this._getSigningMsg);
    this.actions.connector.closeWindow.listen(this._closeWindow);
    this._getConnectorWhitelist();
    this._getWallets();
    this._getConnectingMsg();
    this._getSigningMsg();
    this.currentConnectorWhitelist;
  }

  teardown(): void {
    super.teardown();
  }

  // ========== general ========== //
  @action
  _closeWindow() {
    window.close();
  }

  // ========== connecting wallets ========== //
  @action
  _getConnectingMsg: () => any = () => {
    sendMsgConnect()
      .then(response => {
        runInAction(() => {
          this.connectingMessage = response;
        });
      })
      .catch(err => console.log(err));
  };

  // ========== sign tx confirmation ========== //
  @computed get totalMount(): ?any {
    const txData = this.signingMessage?.sign?.tx ?? {};

    const total = txData?.outputs
      ?.map(item => item.value)
      .reduce((acum, currentValue) => acum + currentValue);

    return total;
  }

  @action
  _getSigningMsg: () => any = () => {
    sendMsgSigningTx()
      .then(response => {
        runInAction(() => {
          this.signingMessage = response;
        });
      })
      .catch(err => console.log(err));
  };

  @action
  _confirmSignInTx: string => void = password => {
    window.chrome.runtime.sendMessage({
      type: 'sign_confirmed',
      tx: this.signingMessage?.sign.tx,
      uid: this.signingMessage?.sign.uid,
      tabId: this.signingMessage?.tabId,
      pw: password,
    });
  };
  @action
  _cancelSignInTx: void => void = () => {
    window.chrome.runtime.sendMessage({
      type: 'sign_rejected',
      uid: this.signingMessage?.sign.uid,
      tabId: this.signingMessage?.tabId,
    });
    this._closeWindow();
  };

  // ========== wallets info ========== //
  @action
  _getWallets: any => any = () => {
    this.loadingWallets = 'pending';
    getWalletsInfo()
      .then(response => {
        runInAction(() => {
          this.loadingWallets = 'success';
          this.wallets = response;
        });
      })
      .catch(err => {
        runInAction(() => {
          this.loadingWallets = 'rejected';
          this.errorWallets = err.message;
        });
      });
  };

  // ========== whitelist ========== //
  @computed get currentConnectorWhitelist(): ?any {
    let { result } = this.getConnectorWhitelist;
    if (result == null) {
      result = this.getConnectorWhitelist.execute().result;
    }
    return result ?? [];
  }
  _getConnectorWhitelist: void => Promise<void> = async () => {
    await this.getConnectorWhitelist.execute();
  };
  _removeWalletFromWhitelist: (url: string) => Promise<void> = async url => {
    const filter = this.currentConnectorWhitelist?.filter(e => e.url !== url);
    // $FlowFixMe:
    await this.setConnectorWhitelist.execute(filter);
    await this.getConnectorWhitelist.execute();
  };
}
