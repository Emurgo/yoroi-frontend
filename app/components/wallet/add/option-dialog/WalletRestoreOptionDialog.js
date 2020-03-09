// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';

import Dialog from '../../../widgets/Dialog';
import DialogCloseButton from '../../../widgets/DialogCloseButton';
import OptionBlock from './OptionBlock';

import styles from './OptionListWrapperStyle.scss';

const messages = defineMessages({
  dialogTitle: {
    id: 'wallet.add.optionDialog.restore.dialogTitle',
    defaultMessage: '!!!Restore wallet',
  },
  restoreNormalTitle: {
    id: 'wallet.add.optionDialog.restore.normalWallet.title',
    defaultMessage: '!!!Enter a 15-word recovery phrase',
  },
  restoreNormalDescription: {
    id: 'wallet.add.optionDialog.restore.normalWallet.description',
    defaultMessage: '!!!If you have a Yoroi recovery phrase consisting of 15 words generated when you created a Yoroi Wallet, choose this option to restore your wallet.',
  },
  restorePaperWalletTitle: {
    id: 'wallet.add.optionDialog.restore.paperWallet.title',
    defaultMessage: '!!!Paper Wallet',
  },
  restorePaperWalletDescription: {
    id: 'wallet.add.optionDialog.restore.paperWallet.description',
    defaultMessage: '!!!If you have generated a Yoroi paper wallet (which is usually printed and kept offline), you can choose this option to import the funds from your Yoroi paper wallet.',
  },
});

type Props = {|
  +onCancel: void => void,
  +onRestore: void => void,
  +onPaperRestore: void => void,
|};

@observer
export default class WalletRestoreOptionDialog extends Component<Props> {
  static contextTypes = {
    intl: intlShape.isRequired,
  };

  render() {
    const { intl } = this.context;
    const { onCancel, onRestore, onPaperRestore, } = this.props;

    return (
      <Dialog
        title={intl.formatMessage(messages.dialogTitle)}
        closeOnOverlayClick={false}
        onClose={onCancel}
        closeButton={<DialogCloseButton />}
        className="WalletRestoreOptionDialog"
      >
        <div className={styles.component}>
          <ul className={styles.optionBlockList}>
            <OptionBlock
              parentName="WalletRestoreOptionDialog"
              type="restoreNormalWallet"
              title={intl.formatMessage(messages.restoreNormalTitle)}
              learnMoreText={intl.formatMessage(messages.restoreNormalDescription)}
              onSubmit={onRestore}
            />
            <OptionBlock
              parentName="WalletRestoreOptionDialog"
              type="restorePaperWallet"
              title={intl.formatMessage(messages.restorePaperWalletTitle)}
              learnMoreText={intl.formatMessage(messages.restorePaperWalletDescription)}
              onSubmit={onPaperRestore}
            />
          </ul>
        </div>
      </Dialog>
    );
  }
}
