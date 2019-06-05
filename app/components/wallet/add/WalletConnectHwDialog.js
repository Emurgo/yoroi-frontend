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
    id: 'wallet.connect.hardware.title',
    defaultMessage: '!!!Connect to hardware wallet',
  },
  ledgerTitle: {
    id: 'wallet.create.type.ledger.title',
    defaultMessage: '!!!Ledger Hardware Wallet',
  },
  ledgerDescription: { // TODO: add descriptionfor wallet
    id: 'wallet.create.type.ledger.description',
    defaultMessage: '!!! TODO: Ledger Hardware Wallet Descriprion',
  },
  trezorTitle: {
    id: 'wallet.create.type.trezor.title',
    defaultMessage: '!!!Trezor Hardware Wallet',
  },
  trezorDescription: {  // TODO: add descriptionfor wallet
    id: 'wallet.create.type.trezor.description',
    defaultMessage: '!!! TODO: Trezor Hardware Wallet Descriprion',
  },
});

type Props = {
  onCancel: Function,
  onTrezor: Function,
  onLedger: Function,
  classicTheme: boolean
};

@observer
export default class WalletConnectHwDialog extends Component<Props> {
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
          <ul className={styles.WalletTypeList}>
            <WalletTypeItem
              action={onLedger}
              type="ledger"
              title={intl.formatMessage(messages.ledgerTitle)}
              description={intl.formatMessage(messages.ledgerDescription)}
            />
            <WalletTypeItem
              action={onTrezor}
              type="trezor"
              title={intl.formatMessage(messages.trezorTitle)}
              description={intl.formatMessage(messages.trezorDescription)}
            />
          </ul>
        </div>
      </Dialog>
    );
  }

}
