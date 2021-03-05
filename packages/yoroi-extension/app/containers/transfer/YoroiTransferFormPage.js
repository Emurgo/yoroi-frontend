// @flow
import type { Node } from 'react';
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';
import { join } from 'lodash';
import { action, observable } from 'mobx';
import ReactToolboxMobxForm from '../../utils/ReactToolboxMobxForm';
import MnemonicInput from '../../components/widgets/forms/MnemonicInput';
import BaseTransferPage from '../../components/transfer/BaseTransferPage';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';

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

  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired
  };

  @observable mnemonicForm: void | ReactToolboxMobxForm;

  @action
  setMnemonicFrom(form: ReactToolboxMobxForm) {
    this.mnemonicForm = form;
  }

  submit: (() => Promise<void>) = async () => {
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

  render(): Node {
    const { intl } = this.context;
    return (
      <BaseTransferPage
        onSubmit={this.submit}
        onBack={this.props.onBack}
        step0={intl.formatMessage(messages.step0)}
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
