// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { Button } from 'react-polymorph/lib/components/Button';
import { ButtonSkin } from 'react-polymorph/lib/skins/simple/ButtonSkin';
import classnames from 'classnames';
import { defineMessages, intlShape, FormattedHTMLMessage } from 'react-intl';
import styles from './WalletAdd.scss';
import { MAX_ADA_WALLETS_COUNT } from '../../config/numbersConfig';

const messages = defineMessages({
  title: {
    id: 'wallet.add.dialog.title.label',
    defaultMessage: '!!!Add wallet',
  },
  createDescription: {
    id: 'wallet.add.dialog.create.description',
    defaultMessage: '!!!Create a new wallet',
  },
  useTrezorDescription: {
    id: 'wallet.add.dialog.trezor.description',
    defaultMessage: '!!!Connect to Trezor',
  },
  useLedgerDescription: {
    id: 'wallet.add.dialog.ledger.description',
    defaultMessage: '!!!Connect to Ledger',
  },
  restoreDescription: {
    id: 'wallet.add.dialog.restore.description',
    defaultMessage: '!!!Restore wallet from backup',
  },
  restorePaperDescription: {
    id: 'wallet.add.dialog.restore.paper.description',
    defaultMessage: '!!!Restore Yoroi paper wallet',
  },
  restoreNotificationMessage: {
    id: 'wallet.add.dialog.restoreNotificationMessage',
    defaultMessage: '!!!Wallet restoration is currently in progress. Until it completes, it is not possible to restore or import new wallets.',
  },
  createTrezorWalletNotificationMessage: {
    id: 'wallet.add.dialog.createTrezorWalletNotificationMessage',
    defaultMessage: '!!!Trezor Connect is currently in progress. Until it completes, it is not possible to restore or import new wallets.',
  },
  createLedgerWalletNotificationMessage: {
    id: 'wallet.add.dialog.createLedgerWalletNotificationMessage',
    defaultMessage: '!!!Ledger Connect is currently in progress. Until it completes, it is not possible to restore or import new wallets.',
  }
});

type Props = {
  onTrezor: Function,
  isCreateTrezorWalletActive: boolean,
  onLedger: Function,
  isCreateLedgerWalletActive: boolean,
  onCreate: Function,
  onRestore: Function,
  onPaperRestore: Function,
  isRestoreActive: boolean,
};

@observer
export default class WalletAdd extends Component<Props> {

  static contextTypes = {
    intl: intlShape.isRequired,
  };

  render() {
    const { intl } = this.context;
    const {
      onTrezor,
      isCreateTrezorWalletActive,
      onLedger,
      isCreateLedgerWalletActive,
      onCreate,
      onRestore,
      onPaperRestore,
      isRestoreActive,
    } = this.props;

    const componentClasses = classnames([styles.component, 'WalletAdd']);

    let activeNotification = null;
    if (isCreateTrezorWalletActive) {
      activeNotification = 'createTrezorWalletNotificationMessage';
    } else if (isCreateLedgerWalletActive) {
      activeNotification = 'createLedgerWalletNotificationMessage';
    } else if (isRestoreActive) {
      activeNotification = 'restoreNotificationMessage';
    }

    return (
      <div className={componentClasses}>
        <div className={styles.buttonsContainer}>
          {/* Enable this when Ledger is available */}
          {/* <Button
            className="primary"
            label={intl.formatMessage(messages.useLedgerDescription)}
            onMouseUp={onLedger}
            skin={ButtonSkin}
          /> */}
          <Button
            className="primary"
            label={intl.formatMessage(messages.useTrezorDescription)}
            onMouseUp={onTrezor}
            skin={ButtonSkin}
          />
          <Button
            className="primary createWalletButton"
            label={intl.formatMessage(messages.createDescription)}
            onMouseUp={onCreate}
            skin={ButtonSkin}
          />
          <Button
            className="primary restoreWalletButton"
            label={intl.formatMessage(messages.restoreDescription)}
            onMouseUp={onRestore}
            skin={ButtonSkin}
          />
          <Button
            className="primary restorePaperWalletButton"
            label={intl.formatMessage(messages.restorePaperDescription)}
            onMouseUp={onPaperRestore}
            skin={ButtonSkin}
          />
          {activeNotification ? (
            <div className={styles.notification}>
              <FormattedHTMLMessage
                {...messages[activeNotification]}
                values={{ maxWalletsCount: MAX_ADA_WALLETS_COUNT }}
              />
            </div>
          ) : null}
        </div>
      </div>
    );
  }

}
