// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';
import { join } from 'lodash';
import { action, observable } from 'mobx';
import ReactToolboxMobxForm from '../../utils/ReactToolboxMobxForm';
import MnemonicInput from '../../components/widgets/forms/MnemonicInput';
import BaseTransferPage from '../../components/transfer/BaseTransferPage';

const messages = defineMessages({
  step0: {
    id: 'yoroiTransfer.form.instructions.step0.text',
    defaultMessage: '!!!Enter the 15-word recovery phrase used to back up your other wallet to restore the balance and transfer all the funds to current wallet.',
  },
});

type Props = {|
  +onSubmit: {| recoveryPhrase: string |} => void,
  +onBack: void => void,
  +mnemonicValidator: string => boolean,
  +validWords: Array<string>,
  +mnemonicLength: number,
  +classicTheme: boolean,
|};

@observer
export default class YoroiTransferFormPage extends Component<Props> {

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
      throw new Error('YoroiTransferFormPage form not set');
    }
    this.mnemonicForm.submit({
      onSuccess: (form) => {
        const { recoveryPhrase } = form.values();
        const payload = {
          recoveryPhrase: join(recoveryPhrase, ' '),
        };
        this.props.onSubmit(payload);
      },
      onError: () => {}
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
