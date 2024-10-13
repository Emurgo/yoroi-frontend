// @flow
import type { Node } from 'react';
import { Component } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';
import { join } from 'lodash';
import { action, observable } from 'mobx';
import ReactToolboxMobxForm from '../../utils/ReactToolboxMobxForm';
import MnemonicInput from '../../components/widgets/forms/MnemonicInput';
import PaperPasswordInput from '../../components/widgets/forms/PaperPasswordInput';
import BaseTransferPage from '../../components/transfer/BaseTransferPage';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';

const messages = defineMessages({
  step0: {
    id: 'yoroiTransfer.form.instructions.step0Paper.text',
    defaultMessage: '!!!Enter the 21-word recovery phrase used to back up your Yoroi Paper wallet and your paper password to restore the balance and transfer all the funds.',
  },
});

type Props = {|
  +onSubmit: {|
    recoveryPhrase: string,
    paperPassword: string,
  |} => void,
  +onBack: void => void,
  +mnemonicValidator: string => boolean,
  +validWords: Array<string>,
  +mnemonicLength: number,
  +passwordMatches: string => boolean,
  +includeLengthCheck: boolean,
|};

@observer
export default class YoroiPaperWalletFormPage extends Component<Props> {

  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
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

  getMnemonic: (() => Promise<string>) = () => {
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
  getPaperPassword: (() => Promise<string>) = () => {
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
  submit: (() => Promise<void>) = async () => {
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

  render(): Node {
    const { intl } = this.context;
    return (
      <BaseTransferPage
        onSubmit={this.submit}
        onBack={this.props.onBack}
        step0={intl.formatMessage(messages.step0)}
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
        />
        <PaperPasswordInput
          setForm={(form) => this.setPaperPasswordFrom(form)}
          passwordMatches={this.props.passwordMatches}
          includeLengthCheck={this.props.includeLengthCheck}
        />
      </BaseTransferPage>
    );
  }
}
