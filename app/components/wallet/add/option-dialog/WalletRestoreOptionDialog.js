// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';
import DialogCloseButton from '../../../widgets/DialogCloseButton';
import Dialog from '../../../widgets/Dialog';
import styles from './OptionListWrapperStyle.scss';
import OptionBlock from './OptionBlock';

const messages = defineMessages({
  dialogTitle: {
    id: 'wallet.add.optionDialog.restore.dialogTitle',
    defaultMessage: '!!!Restore wallet',
  },
  restoreNormalTitle: {
    id: 'wallet.add.optionDialog.restore.normalWallet.title',
    defaultMessage: '!!!Wallet from 15 mnemonic words',
  },
  restoreNormalDescription: {
    id: 'wallet.add.optionDialog.restore.normalWallet.description',
    defaultMessage: '!!!The simplest and most common way to create a Wallet. Yoroi will generate 15 mnemonic words that you will have to store in a safe place in order to restore the wallet.',
  },
  restorePaperWalletTitle: {
    id: 'wallet.add.optionDialog.restore.paperWallet.title',
    defaultMessage: '!!!Paper Wallet',
  },
  restorePaperWalletDescription: {
    id: 'wallet.add.optionDialog.restore.paperWallet.description',
    defaultMessage: '!!!Allows the generation of an offline wallet that should be printed. The process involves setting up an optional password for extra security and then printing a pdf that contains the mnemonics (for later recovery) and some Cardano addresses onto a paper.',
  },
});

type Props = {
  onCancel: Function,
  onRestore: Function,
  onPaperRestore: Function,
  classicTheme: boolean
};

@observer
export default class WalletRestoreOptionDialog extends Component<Props> {
  static contextTypes = {
    intl: intlShape.isRequired,
  };

  render() {
    const { intl } = this.context;
    const { onCancel, onRestore, onPaperRestore, classicTheme } = this.props;

    return (
      <Dialog
        title={intl.formatMessage(messages.dialogTitle)}
        closeOnOverlayClick={false}
        onClose={onCancel}
        closeButton={<DialogCloseButton />}
        classicTheme={classicTheme}
      >
        <div className={styles.tabsContent}>
          <ul className={styles.optionBlockList}>
            <OptionBlock
              onSubmit={onRestore}
              type="restoreNormalWallet"
              title={intl.formatMessage(messages.restoreNormalTitle)}
              learnMoreText={intl.formatMessage(messages.restoreNormalDescription)}
            />
            <OptionBlock
              onSubmit={onPaperRestore}
              type="restorePaperWallet"
              title={intl.formatMessage(messages.restorePaperWalletTitle)}
              learnMoreText={intl.formatMessage(messages.restorePaperWalletDescription)}
            />
          </ul>
        </div>
      </Dialog>
    );
  }
}
