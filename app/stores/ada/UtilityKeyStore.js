// @flow
import { observable, computed, action } from 'mobx';
import Store from '../base/Store';
import Request from '../lib/LocalizedRequest';
import type {
  setUtilityKeyFunc,
  getUtilityKeyFunc,
  getUtilityKeyResponse,
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

  @observable getMemoEncryptionKeyRequest: Request<getUtilityKeyFunc>
    = new Request<getUtilityKeyFunc>(this.api.utilityKey.getMemoEncryptionKey);

  @observable getMemoSigningKeyRequest: Request<getUtilityKeyFunc>
    = new Request<getUtilityKeyFunc>(this.api.utilityKey.getMemoSigningKey);

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

  // TODO: update to support more than one header index
  @computed get getMemoSigningKey(): ?getUtilityKeyResponse {
    if (this.hasSetRootKey) {
      const { result } = this.getMemoSigningKeyRequest.execute({ headerIndex: 0 });
      return result;
    }
    return undefined;
  }

  // TODO: update to support more than one header index
  @computed get getMemoEncryptionKey(): ?getUtilityKeyResponse {
    if (this.hasSetRootKey) {
      const { result } = this.getMemoEncryptionKeyRequest.execute({ headerIndex: 0 });
      return result;
    }
    return undefined;
  }

}
