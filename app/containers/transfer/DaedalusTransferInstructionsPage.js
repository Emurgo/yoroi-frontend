// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';
import globalMessages from '../../i18n/global-messages';
import TransferInstructionsPage from '../../components/transfer/TransferInstructionsPage';

const messages = defineMessages({
  attentionText: {
    id: 'daedalusTransfer.instructions.attention.text',
    defaultMessage: '!!!Yoroi and Daedalus wallets use different key derivation scheme and they each have a separate format for addresses. For this reason, Daedalus wallets cannot be restored and continued to be used in Yoroi and vice versa. This will change in the future. For now, to use funds from your Daedalus wallet, you need to transfer them to your Yoroi wallet. Daedalus and Yoroi wallets are fully compatible for transferring of funds. If you don’t have a working copy of Daedalus, you can use your 12-word recovery phrase (or 27-words for a paper wallet) used to restore and transfer the balance from Daedalus into Yoroi.',
  },
  confirmationText: {
    id: 'daedalusTransfer.instructions.attention.confirmation',
    defaultMessage: '!!!Transfer all funds from Daedalus wallet',
  },
  confirmationPaperText: {
    id: 'daedalusTransfer.instructions.attention.confirmationPaper',
    defaultMessage: '!!!Transfer all funds from Daedalus paper wallet',
  },
  confirmationMasterKeyText: {
    id: 'daedalusTransfer.instructions.attention.confirmationMasterKey',
    defaultMessage: '!!!Transfer all funds from Daedalus master key',
  },
});

messages.fieldIsRequired = globalMessages.fieldIsRequired;

type Props = {
  onFollowInstructionsPrerequisites: Function,
  onConfirm: Function,
  onPaperConfirm: Function,
  onMasterKeyConfirm: Function,
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
      onMasterKeyConfirm,
      disableTransferFunds,
    } = this.props;

    return (
      <TransferInstructionsPage
        onFollowInstructionsPrerequisites={onFollowInstructionsPrerequisites}
        onConfirm={onConfirm}
        onPaperConfirm={onPaperConfirm}
        onMasterKeyConfirm={onMasterKeyConfirm}
        disableTransferFunds={disableTransferFunds}
        attentionText={intl.formatMessage(messages.attentionText)}
        confirmationText={intl.formatMessage(messages.confirmationText)}
        confirmationPaperText={intl.formatMessage(messages.confirmationPaperText)}
        confirmationMasterKeyText={intl.formatMessage(messages.confirmationMasterKeyText)}
      />
    );
  }
}
