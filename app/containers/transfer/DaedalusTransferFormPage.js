// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';
import TransferMnemonicPage from '../../components/transfer/TransferMnemonicPage';
import config from '../../config';

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
  onSubmit: { recoveryPhrase: string } => void,
  onBack: Function,
  mnemonicValidator: Function,
  validWords: Array<string>,
  mnemonicLength: number,
  classicTheme: boolean,
|};

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
      classicTheme
    } = this.props;
    const message = mnemonicLength === config.wallets.DAEDALUS_PAPER_RECOVERY_PHRASE_WORD_COUNT
      ? messages.step0Paper
      : messages.step0;

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
