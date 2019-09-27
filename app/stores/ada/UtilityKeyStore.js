// @flow
import { observable, computed, action } from 'mobx';
import { RustModule } from '../../api/ada/lib/cardanoCrypto/rustLoader';
import Store from '../base/Store';
import Request from '../lib/LocalizedRequest';
import environment from '../../environment';
import {
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
    const { root_cached_key } = await getCurrentCryptoAccount();
    const publicKey = root_cached_key.key().to_hex();
    await this.setRootKeyRequest.execute({ publicKey });
  };

  // TODO: update to support more than one header index
  @computed get getMemoSigningKey(): ?getUtilityKeyResponse {
    const result = null;
    if (this.hasSetRootKey) {
      result = this.getMemoSigningKeyRequest.execute(0);
    }
    return result;
  }

  // TODO: update to support more than one header index
  @computed get getMemoEncryptionKey(): ?getUtilityKeyResponse {
    const result = null;
    if (this.hasSetRootKey) {
      result = this.getMemoEncryptionKeyRequest.execute(0);
    }
    return result;
  }

}
