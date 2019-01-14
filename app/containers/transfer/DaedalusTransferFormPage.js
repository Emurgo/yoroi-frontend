// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';
import globalMessages from '../../i18n/global-messages';
import TransferMnemonicPage from '../../components/transfer/TransferMnemonicPage';

const messages = defineMessages({
  step0: {
    id: 'daedalusTransfer.form.instructions.step0.text',
    defaultMessage: '!!!Enter the 12-word recovery phrase used to back up your Daedalus wallet to restore the balance and transfer all the funds from Daedalus to Icarus.',
    description: 'Text for instructions step 0 on the Daedalus transfer form page.'
  }
});

messages.fieldIsRequired = globalMessages.fieldIsRequired;

type Props = {
  onSubmit: Function,
  onBack: Function,
  mnemonicValidator: Function,
  validWords: Array<string>,
  oldTheme: boolean
};

@observer
export default class DaedalusTransferFormPage extends Component<Props> {

  static contextTypes = {
    intl: intlShape.isRequired
  };

  render() {
    const { intl } = this.context;
    const { validWords, onBack, onSubmit, mnemonicValidator, oldTheme } = this.props;

    return (
      <TransferMnemonicPage
        onSubmit={onSubmit}
        onBack={onBack}
        mnemonicValidator={mnemonicValidator}
        validWords={validWords}
        step0={intl.formatMessage(messages.step0)}
        mnemonicLength={12}
        oldTheme={oldTheme}
      />
    );
  }
}
