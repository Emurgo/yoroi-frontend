/* eslint-disable promise/always-return */
// @flow
import { observable, computed } from 'mobx';
import Request from '../lib/LocalizedRequest';
import Store from '../base/Store';
import type {
  ConnectingMessage,
  WhitelistEntry,
  ConnectedSites,
  RemoveWalletFromWhitelistData,
} from '../../../chrome/extension/connector/types';
import type { ActionsMap } from '../../actions/index';
import type { StoresMap } from '../index';
import { getConnectedSites } from '../../connector/stores/ConnectorStore';
import { noop } from '../../coreUtils';

type GetWhitelistFunc = void => Promise<?Array<WhitelistEntry>>;
type SetWhitelistFunc = {|
  whitelist: Array<WhitelistEntry> | void,
|} => Promise<void>;

export default class ConnectorStore extends Store<StoresMap, ActionsMap> {
  @observable connectingMessage: ?ConnectingMessage = null;
  @observable whiteList: Array<WhitelistEntry> = [];
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
    this._getConnectorWhitelist();
    noop(this.currentConnectorWhitelist);
  }

  teardown(): void {
    super.teardown();
  }

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
  _removeWalletFromWhitelist: (
    request: {| url: string, protocol: string |}
  ) => Promise<void> = async request => {
    const filter = this.currentConnectorWhitelist.filter(
      e => !(e.url === request.url && e.protocol === request.protocol)
    );
    await this.setConnectorWhitelist.execute({
      whitelist: filter,
    });
    await this.getConnectorWhitelist.execute();
    window.chrome.runtime.sendMessage(({
      type: 'remove_wallet_from_whitelist',
      url: request.url,
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