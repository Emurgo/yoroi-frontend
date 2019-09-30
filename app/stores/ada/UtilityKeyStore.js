// @flow
import { observable, computed, action } from 'mobx';
import Store from '../base/Store';
import Request from '../lib/LocalizedRequest';
import type {
  setUtilityKeyFunc,
} from '../../api/utilityKey/index';
import {
  getCurrentCryptoAccount,
} from '../../api/ada/lib/storage/adaLocalStorage';

export default class UtilityKeyStore extends Store {

  setup() {
    this.actions.utilityKeys.setRootKey.listen(this._setRootKey);
  }

  teardown() {
    super.teardown();
  }

  @observable setRootKeyRequest: Request<setUtilityKeyFunc>
    = new Request<setUtilityKeyFunc>(this.api.utilityKey.setRootKey);

  @computed get hasSetRootKey(): boolean {
    return (
      this.setRootKeyRequest.wasExecuted &&
      this.setRootKeyRequest.result !== null
    );
  }

  @action _setRootKey = async () => {
    const account = await getCurrentCryptoAccount();
    if (account) {
      // eslint-disable-next-line
      const { root_cached_key } = account;
      const publicKey = root_cached_key.key().to_hex();
      await this.setRootKeyRequest.execute({ publicKey });
    }
  };

}
