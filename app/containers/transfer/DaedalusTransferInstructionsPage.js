// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';
import TransferInstructionsPage from '../../components/transfer/TransferInstructionsPage';

const messages = defineMessages({
  attentionText: {
    id: 'daedalusTransfer.instructions.attention.text',
    defaultMessage: '!!!Yoroi and Daedalus wallets use different key derivation scheme and they each have a separate format for addresses. For this reason, Daedalus wallets cannot be restored and continued to be used in Yoroi and vice versa. This will change in the future. For now, to use funds from your Daedalus wallet, you need to transfer them to your Yoroi wallet. Daedalus and Yoroi wallets are fully compatible for transferring of funds. If you don’t have a working copy of Daedalus, you can use your 12-word recovery phrase (or 27-words for a paper wallet) used to restore and transfer the balance from Daedalus into Yoroi.',
  },
  transferTitleText: {
    id: 'daedalusTransfer.instructions.attention.title',
    defaultMessage: '!!!Transfer all funds from'
  },
  transferText: {
    id: 'daedalusTransfer.instructions.attention.button.label',
    defaultMessage: '!!!Daedalus Wallet',
  },
  transferPaperText: {
    id: 'daedalusTransfer.instructions.attention.paper.button.label',
    defaultMessage: '!!!Daedalus Paper Wallet',
  },
  transferMasterKeyText: {
    id: 'daedalusTransfer.instructions.attention.masterKey.button.label',
    defaultMessage: '!!!Daedalus Master Key',
  },
});

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
        confirmationTitleText={intl.formatMessage(messages.transferTitleText)}
        confirmationText={intl.formatMessage(messages.transferText)}
        confirmationPaperText={intl.formatMessage(messages.transferPaperText)}
        confirmationMasterKeyText={intl.formatMessage(messages.transferMasterKeyText)}
      />
    );
  }
}
