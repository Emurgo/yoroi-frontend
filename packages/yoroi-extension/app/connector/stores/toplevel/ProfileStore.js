// @flow
import BaseProfileStore from '../../../stores/base/BaseProfileStore';
import type { StoresMap } from '../index';
import { networks } from '../../../api/ada/lib/storage/database/prepackaged/networks';
import { ROUTES } from '../../routes-config';

export default class ProfileStore extends BaseProfileStore<StoresMap> {

  setup(): void {
    super.setup();
    this.stores.loading.registerBlockingLoadingRequest(
      (async () => {
        await this.getProfileLocaleRequest.execute();
      })(),
      'load locale'
    );
  }

  teardown(): void {
    super.teardown();
  }

  getCurrentNetworkId(): number {
    if (window.location.hash.replace(/^#/, '') === ROUTES.SELECT_CASHBACK_WALLET) {
      return networks.CardanoMainnet.NetworkId;
    }
    return super.getCurrentNetworkId();
  }
}
