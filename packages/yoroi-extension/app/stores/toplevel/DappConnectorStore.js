/* eslint-disable promise/always-return */
// @flow
import { observable, computed } from 'mobx';
import Request from '../lib/LocalizedRequest';
import Store from '../base/Store';
import type {
  ConnectingMessage,
  WhitelistEntry,
  ConnectedSites,
} from '../../../chrome/extension/connector/types';
import type { StoresMap } from '../index';
import { noop } from '../../coreUtils';
import {
  getConnectedSites,
  removeWalletFromWhiteList,
} from '../../api/thunk';

type GetWhitelistFunc = void => Promise<?Array<WhitelistEntry>>;
type SetWhitelistFunc = {|
  whitelist: Array<WhitelistEntry> | void,
|} => Promise<void>;

export default class ConnectorStore extends Store<StoresMap> {
  @observable connectingMessage: ?ConnectingMessage = null;
  @observable whiteList: Array<WhitelistEntry> = [];
  @observable getConnectorWhitelistRequest: Request<
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
    noop(this.getConnectorWhitelist());
    noop(this.currentConnectorWhitelist);
  }

  teardown(): void {
    super.teardown();
  }

  // ========== whitelist ========== //
  @computed get currentConnectorWhitelist(): Array<WhitelistEntry> {
    let { result } = this.getConnectorWhitelistRequest;
    if (result == null) {
      result = this.getConnectorWhitelistRequest.execute().result;
    }
    return result ?? [];
  }
  getConnectorWhitelist: void => Promise<void> = async () => {
    await this.getConnectorWhitelistRequest.execute();
  };
  removeWalletFromWhitelist1: (
    request: {| url: string |}
  ) => Promise<void> = async request => {
    const filter = this.currentConnectorWhitelist.filter(
      e => e.url !== request.url
    );
    await this.setConnectorWhitelist.execute({
      whitelist: filter,
    });
    await this.getConnectorWhitelistRequest.execute();
    await removeWalletFromWhiteList({ url: request.url });
  };

  refreshActiveSites: void => Promise<void> = async () => {
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
