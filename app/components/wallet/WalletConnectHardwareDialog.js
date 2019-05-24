// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import classnames from 'classnames';
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
            <WalletTypeItem action={onLedger} type="ledger" />
            <WalletTypeItem action={onTrezor} type="trezor" />
          </ul>
        </div>
      </Dialog>
    );
  }

}
