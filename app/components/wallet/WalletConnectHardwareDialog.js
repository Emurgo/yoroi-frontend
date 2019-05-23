// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import classnames from 'classnames';
import { defineMessages, intlShape } from 'react-intl';
import DialogCloseButton from '../widgets/DialogCloseButton';
import Dialog from '../widgets/Dialog';
import styles from './WalletCreateDialog.scss';

const messages = defineMessages({
  dialogTitle: {
    id: 'wallet.connect.hardware.title',
    defaultMessage: '!!!Connect to hardware wallet',
  },
  walletTrezorTitle: {
    id: 'wallet.create.type.trezor.title',
    defaultMessage: '!!!Trezor Wallet',
  },
  walletLedgerTitle: {
    id: 'wallet.create.type.ledger.title',
    defaultMessage: '!!!Ledger  Wallet',
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
    const dialogClasses = classnames([
      styles.component,
      'WalletConnectDialog',
    ]);

    return (
      <Dialog
        className={dialogClasses}
        title={intl.formatMessage(messages.dialogTitle)}
        closeOnOverlayClick={false}
        onClose={onCancel}
        closeButton={<DialogCloseButton />}
        classicTheme={classicTheme}
      >
        <div className={styles.tabsContent}>
          <ul className={styles.walletTypeList}>
            <li className={styles.walletTypeListItem}>
              <button type="button" onClick={onTrezor} className={styles.walletType}>
                <div className={`${styles.walletTypeImg} ${styles.trezor}`} />
                <h3 className={styles.walletTypeTitle}>
                  {intl.formatMessage(messages.walletTrezorTitle)}
                </h3>
                <p className={styles.walletTypeDesc} />
              </button>
            </li>
            <li className={styles.walletTypeListItem}>
              <button type="button" onClick={onLedger} className={styles.walletType}>
                <div className={`${styles.walletTypeImg} ${styles.ledger}`} />
                <h3 className={styles.walletTypeTitle}>
                  {intl.formatMessage(messages.walletLedgerTitle)}
                </h3>
                <p className={styles.walletTypeDesc} />
              </button>
            </li>
          </ul>
        </div>
      </Dialog>
    );
  }

}
