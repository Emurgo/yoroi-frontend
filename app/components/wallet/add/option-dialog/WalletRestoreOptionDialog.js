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
    defaultMessage: '!!!Enter a 15-word Yoroi recovery phrase',
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
        <div className={styles.component}>
          <ul className={styles.optionBlockList}>
            <OptionBlock
              parentName={this.constructor.name}
              type="restoreNormalWallet"
              title={intl.formatMessage(messages.restoreNormalTitle)}
              learnMoreText={intl.formatMessage(messages.restoreNormalDescription)}
              onSubmit={onRestore}
            />
            <OptionBlock
              parentName={this.constructor.name}
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
