// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';
import globalMessages from '../../i18n/global-messages';
import TransferMnemonicPage from '../../components/transfer/TransferMnemonicPage';
import type { Theme } from '../../themes';

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

messages.fieldIsRequired = globalMessages.fieldIsRequired;

type Props = {
  onSubmit: Function,
  onBack: Function,
  mnemonicValidator: Function,
  validWords: Array<string>,
  mnemonicLength: number,
  currentTheme: Theme,
};

@observer
export default class DaedalusTransferFormPage extends Component<Props> {

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
      currentTheme
    } = this.props;
    const message = mnemonicLength === 27 ? messages.step0Paper : messages.step0;

    return (
      <TransferMnemonicPage
        onSubmit={onSubmit}
        onBack={onBack}
        mnemonicValidator={mnemonicValidator}
        validWords={validWords}
        step0={intl.formatMessage(message)}
        mnemonicLength={mnemonicLength}
        currentTheme={currentTheme}
      />
    );
  }
}
