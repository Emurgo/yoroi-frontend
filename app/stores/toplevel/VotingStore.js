// @flow

import { observable, action, runInAction } from 'mobx';
import Store from '../base/Store';
import { Logger } from '../../utils/logging';
import { encryptWithPassword, decryptWithPassword } from '../../utils/catalystCipher';

import { generatePrivateKeyForCatalyst } from '../../api/ada/lib/cardanoCrypto/cryptoWallet';

export default class VotingStore extends Store {
  @observable encryptedKey: ?string = null;

  setup(): void {
    super.setup();
    const actions = this.actions.ada.voting;
    actions.generateEncryptedKey.listen(this._generateEncryptedKey);
  }

  @action _generateEncryptedKey: (Array<number>) => Promise<void> = async passwordArray => {
    Logger.info(
      `${nameof(VotingStore)}::${nameof(this._generateEncryptedKey)} called: ` +
        passwordArray.join(' ')
    );
    const passBuff = Buffer.from(passwordArray);
    const rootKey = generatePrivateKeyForCatalyst();
    const key = await encryptWithPassword(passBuff, rootKey.to_raw_key().as_bytes());
    runInAction(() => {
      this.encryptedKey = key;
    });
  };
}
