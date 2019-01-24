// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';
import globalMessages from '../../i18n/global-messages';
import TransferInstructionsPage from '../../components/transfer/TransferInstructionsPage';

const messages = defineMessages({
  attentionText: {
    id: 'daedalusTransfer.instructions.attention.text',
    defaultMessage: '!!!Yoroi and Daedalus wallets use different key derivation scheme and they each have a separate format for addresses. For this reason, Daedalus wallets cannot be restored and continued to be used in Icarus and vice versa. This will change in the future. For now, to use funds from your Daedalus wallet, you need to transfer them to your Icarus wallet. Daedalus and Icarus wallets are fully compatible for transferring of funds. If you don’t have a working copy of Daedalus, you can use your 12-word recovery phrase (or 27-words for a paper wallet) used to restore and transfer the balance from Daedalus into Icarus.',
    description: 'Attention text on the Daedalus transfer instructions page.'
  },
  confirmationText: {
    id: 'daedalusTransfer.instructions.attention.confirmation',
    defaultMessage: '!!!Transfer all funds from Daedalus wallet',
    description: 'Label "Transfer all funds from Daedalus wallet" on the Daedalus transfer instructions page.'
  },
  confirmationPaperText: {
    id: 'daedalusTransfer.instructions.attention.confirmationPaper',
    defaultMessage: '!!!Transfer all funds from Daedalus Paper wallet',
    description: 'Label "Transfer all funds from Daedalus Paper wallet" on the Daedalus transfer instructions page.'
  },
});

messages.fieldIsRequired = globalMessages.fieldIsRequired;

type Props = {
  onFollowInstructionsPrerequisites: Function,
  onConfirm: Function,
  onPaperConfirm: Function,
  disableTransferFunds: boolean,
};

@observer
export default class DaedalusTransferInstructionsPage extends Component<Props> {

  static contextTypes = {
    intl: intlShape.isRequired
  };

  render() {
    const { intl } = this.context;
    const {
      onFollowInstructionsPrerequisites,
      onConfirm,
      onPaperConfirm,
      disableTransferFunds,
    } = this.props;

    return (
      <TransferInstructionsPage
        onFollowInstructionsPrerequisites={onFollowInstructionsPrerequisites}
        onConfirm={onConfirm}
        onPaperConfirm={onPaperConfirm}
        disableTransferFunds={disableTransferFunds}
        attentionText={intl.formatMessage(messages.attentionText)}
        confirmationText={intl.formatMessage(messages.confirmationText)}
        confirmationPaperText={intl.formatMessage(messages.confirmationPaperText)}
      />
    );
  }
}
