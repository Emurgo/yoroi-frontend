// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';
import config from '../../config';
import { join } from 'lodash';
import { action, observable } from 'mobx';
import ReactToolboxMobxForm from '../../utils/ReactToolboxMobxForm';
import MnemonicInput from '../../components/widgets/forms/MnemonicInput';
import BaseTransferPage from '../../components/transfer/BaseTransferPage';

const messages = defineMessages({
  step0: {
    id: 'daedalusTransfer.form.instructions.step0.text',
    defaultMessage: '!!!Enter the 12-word recovery phrase used to back up your Daedalus wallet to restore the balance and transfer all the funds from Daedalus to Yoroi.',
  },
  step0Paper: {
    id: 'daedalusTransfer.form.instructions.step0Paper.text',
    defaultMessage: '!!!Enter the 27-word recovery phrase used to back up your Daedalus Paper wallet to restore the balance and transfer all the funds from Daedalus to Yoroi.',
  },
});

type Props = {|
  +onSubmit: {| recoveryPhrase: string |} => PossiblyAsync<void>,
  +onBack: void => void,
  +mnemonicValidator: string => boolean,
  +validWords: Array<string>,
  +mnemonicLength: number,
  +classicTheme: boolean,
|};

@observer
export default class DaedalusTransferFormPage extends Component<Props> {

  static contextTypes = {
    intl: intlShape.isRequired
  };

  static contextTypes = {
    intl: intlShape.isRequired
  };

  @observable mnemonicForm: void | ReactToolboxMobxForm;

  @action
  setMnemonicFrom(form: ReactToolboxMobxForm) {
    this.mnemonicForm = form;
  }

  submit = async () => {
    if (this.mnemonicForm == null) {
      throw new Error('DaedalusTransferFormPage form not set');
    }
    this.mnemonicForm.submit({
      onSuccess: async (form) => {
        const { recoveryPhrase } = form.values();
        const payload = {
          recoveryPhrase: join(recoveryPhrase, ' '),
        };
        await this.props.onSubmit(payload);
      },
      onError: () => {}
    });
  };

  render() {
    const { intl } = this.context;
    const {
      mnemonicLength,
    } = this.props;
    const message = mnemonicLength === config.wallets.DAEDALUS_PAPER_RECOVERY_PHRASE_WORD_COUNT
      ? messages.step0Paper
      : messages.step0;
    return (
      <BaseTransferPage
        onSubmit={this.submit}
        onBack={this.props.onBack}
        step0={intl.formatMessage(message)}
        classicTheme={this.props.classicTheme}
        isDisabled={this.mnemonicForm == null || this.mnemonicForm.hasError}
      >
        <MnemonicInput
          setForm={(form) => this.setMnemonicFrom(form)}
          mnemonicValidator={this.props.mnemonicValidator}
          validWords={this.props.validWords}
          mnemonicLength={this.props.mnemonicLength}
          classicTheme={this.props.classicTheme}
        />
      </BaseTransferPage>
    );
  }
}
