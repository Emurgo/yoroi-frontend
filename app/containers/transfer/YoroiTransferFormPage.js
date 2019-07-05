// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';
import TransferMnemonicPage from '../../components/transfer/TransferMnemonicPage';

const messages = defineMessages({
  step0: {
    id: 'yoroiTransfer.form.instructions.step0.text',
    defaultMessage: '!!!Enter the 15-word recovery phrase used to back up anothe wallet to restore the balance and transfer all the funds to current wallet.',
  },
});

type Props = {|
  onSubmit: Function,
  onBack: Function,
  mnemonicValidator: Function,
  validWords: Array<string>,
  mnemonicLength: number,
  classicTheme: boolean,
|};

@observer
export default class YoroiTransferFormPage extends Component<Props> {

  static contextTypes = {
    intl: intlShape.isRequired
  };

  render() {
    const { intl } = this.context;
    const {
      validWords,
      onBack,
      onSubmit,
      mnemonicValidator,
      mnemonicLength,
      classicTheme
    } = this.props;
    const message =  messages.step0;

    return (
      <TransferMnemonicPage
        onSubmit={onSubmit}
        onBack={onBack}
        mnemonicValidator={mnemonicValidator}
        validWords={validWords}
        step0={intl.formatMessage(message)}
        mnemonicLength={mnemonicLength}
        classicTheme={classicTheme}
      />
    );
  }
}
