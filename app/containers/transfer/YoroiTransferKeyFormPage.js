// @flow
import type { Node } from 'react';
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';
import { action, observable, runInAction } from 'mobx';
import ReactToolboxMobxForm from '../../utils/ReactToolboxMobxForm';
import YoroiKeyInput from '../../components/widgets/forms/YoroiKeyInput';
import DecryptionPassword from '../../components/widgets/forms/DecryptionPassword';
import BaseTransferPage from '../../components/transfer/BaseTransferPage';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { decryptWithPassword } from '../../utils/passwordCipher';
import { RustModule } from '../../api/ada/lib/cardanoCrypto/rustLoader';
import { WrongPassphraseError } from '../../api/ada/lib/cardanoCrypto/cryptoErrors';
import {
  IncorrectWalletPasswordError,
} from '../../api/common/errors';
import LocalizableError from '../../i18n/LocalizableError';

const messages = defineMessages({
  step0: {
    id: 'yoroiTransfer.form.instructions.stakingKEy.text',
    defaultMessage: '!!!Enter your staking key here and the spending password if the key is encrypted',
  },
});

type Props = {|
  +onSubmit: {| key: string, |} => PossiblyAsync<void>,
  +onBack: void => void,
  +classicTheme: boolean,
  +derivationPath: Array<number>,
|};

// times 2 because it's hex encoding (2 letters per byte)
const Lengths = Object.freeze({
  EncryptedWithChaincode: 156 * 2,
  EncryptedWithoutChaincode: 124 * 2,
  UnencryptedWithChaincode: 96 * 2,
  UnencryptedWithoutChaincode: 64 * 2,
});

@observer
export default class YoroiTransferKeyFormPage extends Component<Props> {

  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired
  };

  @observable keyForm: void | ReactToolboxMobxForm;
  @observable passwordForm: void | ReactToolboxMobxForm;
  @observable error: void | LocalizableError;

  @action
  setKeyForm(form: ReactToolboxMobxForm) {
    this.keyForm = form;
  }
  @action
  setPasswordForm(form: ReactToolboxMobxForm) {
    this.passwordForm = form;
  }

  getKey: void => Promise<string> = () => new Promise((resolve, reject) => {
    if (this.keyForm == null) {
      throw new Error(`${nameof(YoroiTransferKeyFormPage)} key form not set`);
    }
    this.keyForm.submit({
      onSuccess: (keyForm) => {
        const { key } = keyForm.values();
        return resolve(key);
      },
      onError: () => reject()
    });
  });
  getDecryptionPassword: void => Promise<string> = () => new Promise((resolve, reject) => {
    if (this.passwordForm == null) {
      throw new Error(`${nameof(YoroiTransferKeyFormPage)} password form not set`);
    }
    this.passwordForm.submit({
      onSuccess: (passwordForm) => {
        const { decryptionPassword } = passwordForm.values();
        return resolve(decryptionPassword);
      },
      onError: () => reject()
    });
  });

  isEncrypted: string => boolean = (key) => {
    return (
      key.length === Lengths.EncryptedWithChaincode ||
      key.length === Lengths.EncryptedWithoutChaincode
    );
  }
  decryptKey: string => Promise<string> = async (key) => {
    if (this.isEncrypted(key)) {
      const decryptionPassword = await this.getDecryptionPassword();
      const decryptedKey = Buffer.from(
        decryptWithPassword(decryptionPassword, key)
      ).toString('hex');
      return decryptedKey;
    }
    return key;
  }

  stripChaincode: string => string = (key) => {
    if (
      key.length === Lengths.UnencryptedWithChaincode
    ) {
      const wasmKey = RustModule.WalletV4.Bip32PrivateKey.from_bytes(
        Buffer.from(key, 'hex')
      );
      let finalKey = wasmKey;
      for (const index of this.props.derivationPath) {
        finalKey = finalKey.derive(index);
      }
      return Buffer.from(
        finalKey.to_raw_key().as_bytes()
      ).toString('hex');
    }
    return key;
  }

  submit: (() => Promise<void>) = async () => {
    runInAction(() => { this.error = undefined; });
    try {
      const key = await this.getKey();
      const decryptedKey = await this.decryptKey(key);
      const rawKey = this.stripChaincode(decryptedKey);

      return this.props.onSubmit({ key: rawKey });
    } catch (error) {
      if (error instanceof WrongPassphraseError) {
        runInAction(() => { this.error = new IncorrectWalletPasswordError(); });
      }
    }
  };

  @action
  clearPassword: string => void = (key) => {
    if (!this.isEncrypted(key) && this.passwordForm != null) {
      // console.log(this.passwordForm.value);
      this.passwordForm.clear();
      // console.log(this.passwordForm.value);
    }
  }

  render(): Node {
    const { intl } = this.context;

    const keyInForm = this.keyForm?.values().key;
    return (
      <BaseTransferPage
        onSubmit={this.submit}
        onBack={this.props.onBack}
        step0={intl.formatMessage(messages.step0)}
        isDisabled={this.keyForm == null || this.keyForm.hasError}
        error={this.error}
      >
        <YoroiKeyInput
          setForm={(form) => this.setKeyForm(form)}
          classicTheme={this.props.classicTheme}
          validLengths={Object.keys(Lengths).map(keyType => Lengths[keyType])}
          onUpdate={key => this.clearPassword(key)}
        />
        <DecryptionPassword
          setForm={(form) => this.setPasswordForm(form)}
          classicTheme={this.props.classicTheme}
          onChange={() => runInAction(() => { this.error = undefined; })}
          isDisabled={keyInForm == null || !this.isEncrypted(keyInForm)}
        />
      </BaseTransferPage>
    );
  }
}
