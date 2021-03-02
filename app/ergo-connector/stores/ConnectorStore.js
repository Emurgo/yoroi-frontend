/* eslint-disable promise/always-return */
// @flow
import { observable, action, runInAction, computed } from 'mobx';
import { getWalletsInfo } from '../../../chrome/extension/background';
import Request from '../../stores/lib/LocalizedRequest';
import Store from '../../stores/base/Store';
import type {
  AccountInfo,
  ConfirmedSignData,
  ConnectingMessage,
  FailedSignData,
  SigningMessage,
  WhitelistEntry,
} from '../../../chrome/extension/ergo-connector/types';
import type { ActionsMap } from '../actions/index';
import type { StoresMap } from './index';

// Need to run only once - Connecting wallets
let initedConnecting = false;
function sendMsgConnect(): Promise<ConnectingMessage> {
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
function sendMsgSigningTx(): Promise<SigningMessage> {
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

type GetWhitelistFunc = void => Promise<?Array<WhitelistEntry>>;
type SetWhitelistFunc = {|
  whitelist: Array<WhitelistEntry> | void,
|} => Promise<void>;

export default class ConnectorStore extends Store<StoresMap, ActionsMap> {
  @observable connectingMessage: ?ConnectingMessage = null;
  @observable whiteList: Array<WhitelistEntry> = [];

  @observable loadingWallets: 'idle' | 'pending' | 'success' | 'rejected' = 'idle';
  @observable errorWallets: string = '';
  @observable wallets: Array<AccountInfo> = [];

  @observable getConnectorWhitelist: Request<
    GetWhitelistFunc
  > = new Request<GetWhitelistFunc>(
    this.api.localStorage.getWhitelist
  );
  @observable setConnectorWhitelist: Request<SetWhitelistFunc> = new Request<
    SetWhitelistFunc
  >(({ whitelist }) => this.api.localStorage.setWhitelist(whitelist));

  @observable signingMessage: ?SigningMessage = null;

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
  _getConnectingMsg: () => Promise<void> = async () => {
    await sendMsgConnect()
      .then(response => {
        runInAction(() => {
          this.connectingMessage = response;
        });
      })
      .catch(err => console.log(err));
  };

  // ========== sign tx confirmation ========== //
  @computed get totalAmount(): ?any {
    const pendingSign = this.signingMessage?.sign ?? {};
    if (pendingSign.tx == null) {
      return undefined;
    }
    const txData = pendingSign.tx ?? {};

    const total = txData.outputs
      .map(item => item.value)
      .reduce((acum, currentValue) => acum + currentValue);

    return total;
  }

  @action
  _getSigningMsg: () => Promise<void> = async () => {
    await sendMsgSigningTx()
      .then(response => {
        runInAction(() => {
          this.signingMessage = response;
        });
      })
      .catch(err => console.log(err));
  };

  @action
  _confirmSignInTx: string => void = password => {
    if (this.signingMessage == null) {
      throw new Error(`${nameof(this._confirmSignInTx)} confirming a tx but no signing message set`);
    }
    const { signingMessage } = this;
    if (signingMessage.sign.tx == null) {
      throw new Error(`${nameof(this._confirmSignInTx)} signing non-tx is not supported`);
    }
    const sendData: ConfirmedSignData = {
      type: 'sign_confirmed',
      tx: signingMessage.sign.tx,
      uid: signingMessage.sign.uid,
      tabId: signingMessage.tabId,
      pw: password,
    };
    window.chrome.runtime.sendMessage(sendData);
  };
  @action
  _cancelSignInTx: void => void = () => {
    if (this.signingMessage == null) {
      throw new Error(`${nameof(this._confirmSignInTx)} confirming a tx but no signing message set`);
    }
    const { signingMessage } = this;
    const sendData: FailedSignData = {
      type: 'sign_rejected',
      uid: signingMessage.sign.uid,
      tabId: signingMessage.tabId,
    };
    window.chrome.runtime.sendMessage(sendData);
    this._closeWindow();
  };

  // ========== wallets info ========== //
  @action
  _getWallets: void => Promise<void> = async () => {
    this.loadingWallets = 'pending';
    await getWalletsInfo()
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
  @computed get currentConnectorWhitelist(): ?Array<WhitelistEntry> {
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
    await this.setConnectorWhitelist.execute({
      whitelist: filter,
    });
    await this.getConnectorWhitelist.execute();
  };
}
