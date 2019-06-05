// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';
import DialogCloseButton from '../../widgets/DialogCloseButton';
import Dialog from '../../widgets/Dialog';
import styles from './WalletCreateOptions.scss';
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
  walletMasterDescription: {
    id: 'wallet.create.type.master.description',
    defaultMessage: '!!!Only useful if you have used a migration feature in another wallet. This allows you to import that wallet into Yoroi.',
  },
  walletPaperTitle: {
    id: 'wallet.create.type.paper.title',
    defaultMessage: '!!!Paper Wallet',
  },
  walletPaperDescription: {
    id: 'wallet.create.type.paper.description',
    defaultMessage: '!!!Allows the generation of an offline wallet that should be printed. The process involves setting up an optional password for extra security and then printing a pdf that contains the mnemonics (for later recovery) and some Cardano addresses onto a paper.',
  },
  walletTabsRecommended: {
    id: 'wallet.create.tabs.recommended.title',
    defaultMessage: '!!!Recommended',
  },
  walletTabsAdvanced: {
    id: 'wallet.create.tabs.advanced.title',
    defaultMessage: '!!!Advanced',
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
        {/* <div className={styles.tabs}>
          <button
            type="button"
            className={`${styles.tabsLink} ${styles.active}`}>
            {intl.formatMessage(messages.walletTabsRecommended)}
          </button>
          <button
            type="button"
            className={styles.tabsLink}>
            {intl.formatMessage(messages.walletTabsAdvanced)}
          </button>
        </div> */}
        <div className={styles.tabsContent}>
          <ul className={styles.WalletTypeList}>
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
              description={intl.formatMessage(messages.walletPaperDescription)}
            />
          </ul>
        </div>
      </Dialog>
    );
  }

}
