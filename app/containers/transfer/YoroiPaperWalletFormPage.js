// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';
import { join } from 'lodash';
import { action, observable } from 'mobx';
import ReactToolboxMobxForm from '../../utils/ReactToolboxMobxForm';
import MnemonicInput from '../../components/widgets/forms/MnemonicInput';
import PaperPasswordInput from '../../components/widgets/forms/PaperPasswordInput';
import BaseTransferPage from '../../components/transfer/BaseTransferPage';

const messages = defineMessages({
  // TODO: update
  step0: {
    id: 'yoroiTransfer.form.instructions.step0.text',
    defaultMessage: '!!!Enter the 15-word recovery phrase used to back up your other wallet to restore the balance and transfer all the funds to current wallet.',
  },
});

type Props = {|
  onSubmit: {|
    recoveryPhrase: string,
    paperPassword: string,
  |} => void,
  onBack: void => void,
  mnemonicValidator: string => boolean,
  validWords: Array<string>,
  mnemonicLength: number,
  passwordValidator: string => boolean,
  classicTheme: boolean,
|};

@observer
export default class YoroiPaperWalletFormPage extends Component<Props> {

  static contextTypes = {
    intl: intlShape.isRequired
  };

  @observable mnemonicForm: void | ReactToolboxMobxForm;
  @observable paperPasswordForm: void | ReactToolboxMobxForm;

  @action
  setMnemonicFrom(form: ReactToolboxMobxForm) {
    this.mnemonicForm = form;
  }

  @action
  setPaperPasswordFrom(form: ReactToolboxMobxForm) {
    this.paperPasswordForm = form;
  }

  getMnemonic = () => {
    return new Promise<string>((resolve, reject) => {
      if (this.mnemonicForm == null) {
        throw new Error('YoroiPaperWalletFormPage mnemonicForm not set');
      }
      this.mnemonicForm.submit({
        onSuccess: (form) => {
          const { recoveryPhrase } = form.values();
          resolve(join(recoveryPhrase, ' '));
        },
        onError: () => reject()
      });
    });
  }
  getPaperPassword = () => {
    return new Promise<string>((resolve, reject) => {
      if (this.paperPasswordForm == null) {
        throw new Error('YoroiPaperWalletFormPage paperPasswordForm not set');
      }
      this.paperPasswordForm.submit({
        onSuccess: (form) => {
          const { paperPassword } = form.values();
          resolve(paperPassword);
        },
        onError: () => reject()
      });
    });
  }
  submit = async () => {
    if (this.mnemonicForm == null) {
      throw new Error('YoroiPaperWalletFormPage form not set');
    }
    const mnemonic = await this.getMnemonic();
    const password = await this.getPaperPassword();
    this.props.onSubmit({
      recoveryPhrase: mnemonic,
      paperPassword: password,
    });
  };

  render() {
    const { intl } = this.context;
    return (
      <BaseTransferPage
        onSubmit={this.submit}
        onBack={this.props.onBack}
        step0={intl.formatMessage(messages.step0)}
        classicTheme={this.props.classicTheme}
        isDisabled={
          this.mnemonicForm == null ||
          this.mnemonicForm.hasError ||
          this.paperPasswordForm == null ||
          this.paperPasswordForm.hasError
        }
      >
        <MnemonicInput
          setForm={(form) => this.setMnemonicFrom(form)}
          mnemonicValidator={this.props.mnemonicValidator}
          validWords={this.props.validWords}
          mnemonicLength={this.props.mnemonicLength}
          classicTheme={this.props.classicTheme}
        />
        <PaperPasswordInput
          setForm={(form) => this.setPaperPasswordFrom(form)}
          passwordValidator={this.props.passwordValidator}
          classicTheme={this.props.classicTheme}
        />
      </BaseTransferPage>
    );
  }
}
