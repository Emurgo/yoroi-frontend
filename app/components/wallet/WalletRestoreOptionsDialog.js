// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';
import DialogCloseButton from '../widgets/DialogCloseButton';
import Dialog from '../widgets/Dialog';
import styles from './WalletCreateDialog.scss';
import WalletTypeItem from './WalletTypeItem';

const messages = defineMessages({
  dialogTitle: {
    id: 'wallet.restore.dialog.title.label',
    defaultMessage: '!!!Restore wallet',
  },
  walletMnemonicTitle: {
    id: 'wallet.create.type.mnemonic.title',
    defaultMessage: '!!!Wallet from 15 mnemonic words',
  },
  walletMnemonicDescription: {
    id: 'wallet.create.type.mnemonic.description',
    defaultMessage: '!!!The simplest and most common way to create a Wallet. Yoroi will generate 15 mnemonic words that you will have to store in a safe place in order to restore the wallet.',
  },
  walletPaperTitle: {
    id: 'wallet.create.type.paper.title',
    defaultMessage: '!!!Paper Wallet',
  },
});

type Props = {
  onCancel: Function,
  onRestore: Function,
  onPaperRestore: Function,
  classicTheme: boolean
};

@observer
export default class WalletRestoreOptionsDialog extends Component<Props> {
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
          <ul className={styles.heroWalletTypeList}>
            <WalletTypeItem
              action={onRestore}
              type="mnemonic"
              title={intl.formatMessage(messages.walletMnemonicTitle)}
              description={intl.formatMessage(messages.walletMnemonicDescription)}
            />
            <WalletTypeItem
              action={onPaperRestore}
              type="paper"
              title={intl.formatMessage(messages.walletPaperTitle)}
            />
          </ul>
        </div>
      </Dialog>
    );
  }

}
