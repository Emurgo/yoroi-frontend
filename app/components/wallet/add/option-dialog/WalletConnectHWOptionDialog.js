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
    id: 'wallet.add.optionDialog.connect.hw.dialogTitle',
    defaultMessage: '!!!Connect to hardware wallet',
  },
  ledgerTitle: {
    id: 'wallet.add.optionDialog.connect.hw.ledger.title',
    defaultMessage: '!!!Ledger Hardware Wallet',
  },
  ledgerDescription: {
    id: 'wallet.add.optionDialog.connect.hw.ledger.learnMoreText',
    defaultMessage: '!!!A Ledger hardware wallet is a small USB device that adds an extra level of security to your wallet. It is more secure because your private key never leaves the hardware wallet. This protects your funds even if your computer is compromised due to malware, phishing attempts, etc.',
  },
  trezorTitle: {
    id: 'wallet.add.optionDialog.connect.hw.trezor.title',
    defaultMessage: '!!!Trezor Hardware Wallet',
  },
  trezorDescription: {
    id: 'wallet.add.optionDialog.connect.hw.trezor.learnMoreText',
    defaultMessage: '!!!A Trezor hardware wallet is a small USB device that adds an extra level of security to your wallet. It is more secure because your private key never leaves the hardware wallet. This protects your funds even if your computer is compromised due to malware, phishing attempts, etc.',
  },
});

type Props = {|
  +onCancel: Function,
  +onTrezor: Function,
  +onLedger: Function,
  +classicTheme: boolean
|};

@observer
export default class WalletConnectHWOptionDialog extends Component<Props> {
  static contextTypes = {
    intl: intlShape.isRequired,
  };

  render() {
    const { intl } = this.context;
    const { onCancel, onTrezor, onLedger, classicTheme } = this.props;

    return (
      <Dialog
        title={intl.formatMessage(messages.dialogTitle)}
        closeOnOverlayClick={false}
        onClose={onCancel}
        closeButton={<DialogCloseButton />}
        classicTheme={classicTheme}
        className="WalletConnectHWOptionDialog"
      >
        <div className={styles.component}>
          <ul className={styles.optionBlockList}>
            <OptionBlock
              parentName="WalletConnectHWOptionDialog"
              type="connectLedger"
              title={intl.formatMessage(messages.ledgerTitle)}
              learnMoreText={intl.formatMessage(messages.ledgerDescription)}
              onSubmit={onLedger}
            />
            <OptionBlock
              parentName="WalletConnectHWOptionDialog"
              type="connectTrezor"
              onSubmit={onTrezor}
              title={intl.formatMessage(messages.trezorTitle)}
              learnMoreText={intl.formatMessage(messages.trezorDescription)}
            />
          </ul>
        </div>
      </Dialog>
    );
  }
}
