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
    description: 'Label for the "Add wallet" title on the wallet add dialog.',
  },
  createDescription: {
    id: 'wallet.add.dialog.create.description',
    defaultMessage: '!!!Create a new wallet',
    description: 'Description for the "Create" button on the wallet add dialog.',
  },
  useTrezorDescription: {
    id: 'wallet.add.dialog.trezor.description',
    defaultMessage: '!!!Connect to Trezor',
    description: 'Description for the "Trezor" button on the wallet add dialog.',
  },
  restoreDescription: {
    id: 'wallet.add.dialog.restore.description',
    defaultMessage: '!!!Restore wallet from backup',
    description: 'Description for the "Restore" button without paper wallet certificate on the wallet add dialog.',
  },
  restoreNotificationMessage: {
    id: 'wallet.add.dialog.restoreNotificationMessage',
    defaultMessage: '!!!Wallet restoration is currently in progress. Until it completes, it is not possible to restore or import new wallets.',
    description: 'Restore notification message shown during async wallet restore on the wallet add screen.',
  },
  createTrezorWalletNotificationMessage: {
    id: 'wallet.add.dialog.createTrezorWalletNotificationMessage',
    defaultMessage: '!!!Trezor Connect is currently in progress. Until it completes, it is not possible to restore or import new wallets.',
    description: 'Trezor Connect notification message shown during async wallet restore for Hardware wallet on the wallet add screen.',
  }
});

type Props = {
  onTrezor: Function,
  isCreateTrezorWalletActive: boolean,
  onCreate: Function,
  onRestore: Function,
  isRestoreActive: boolean,
  classicTheme: boolean,
  title: string
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
      onCreate,
      onRestore,
      isRestoreActive,
      classicTheme,
      title
    } = this.props;

    const componentClasses = classnames([styles.component, 'WalletAdd']);
    const createWalletButtonClasses = classnames([
      classicTheme ? 'primary' : 'outlined',
      'createWalletButton'
    ]);
    const restoreWalletButtonClasses = classnames([
      classicTheme ? 'primary' : 'outlined',
      'restoreWalletButton'
    ]);
    const buttonsContainerClasses = classnames([
      classicTheme ? styles.buttonsContainerClassic : styles.buttonsContainer
    ]);

    let activeNotification = null;
    if (isCreateTrezorWalletActive) {
      activeNotification = 'createTrezorWalletNotificationMessage';
    } else if (isRestoreActive) {
      activeNotification = 'restoreNotificationMessage';
    }

    return (
      <div className={componentClasses}>
        <div className={buttonsContainerClasses}>
          {!classicTheme && (
            <div className={styles.title}>{title}</div>
          )}

          <Button
            className="primary trezorWalletButton"
            label={intl.formatMessage(messages.useTrezorDescription)}
            onMouseUp={onTrezor}
            skin={ButtonSkin}
          />
          <Button
            className={createWalletButtonClasses}
            label={intl.formatMessage(messages.createDescription)}
            onMouseUp={onCreate}
            skin={ButtonSkin}
          />
          <Button
            className={restoreWalletButtonClasses}
            label={intl.formatMessage(messages.restoreDescription)}
            onMouseUp={onRestore}
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

        {!classicTheme && <div className={styles.background} />}

        {!classicTheme && <div className={styles.walletImage} />}
      </div>
    );
  }

}
