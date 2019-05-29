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
    id: 'wallet.connect.hardware.title',
    defaultMessage: '!!!Connect to hardware wallet',
  },
  trezorTitle: {
    id: 'wallet.create.type.trezor.title',
    defaultMessage: '!!!Trezor Hardware Wallet',
  },
  ledgerTitle: {
    id: 'wallet.create.type.ledger.title',
    defaultMessage: '!!!Ledger Hardware Wallet',
  },
  trezorDescription: {
    id: 'wallet.create.type.trezor.description',
    defaultMessage: '!!!Trezor Hardware Wallet Descriprion',
  },
  ledgerDescription: {
    id: 'wallet.create.type.ledger.description',
    defaultMessage: '!!!Ledger Hardware Wallet Descriprion',
  },
});

type Props = {
  onCancel: Function,
  onTrezor: Function,
  onLedger: Function,
  classicTheme: boolean
};

@observer
export default class WalletConnectHardwareDialog extends Component<Props> {
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
      >
        <div className={styles.tabsContent}>
          <ul className={styles.heroWalletTypeList}>
            <WalletTypeItem action={onLedger} type="ledger" title={intl.formatMessage(messages.ledgerTitle)} />
            <WalletTypeItem action={onTrezor} type="trezor" title={intl.formatMessage(messages.trezorTitle)} />
          </ul>
        </div>
      </Dialog>
    );
  }

}
