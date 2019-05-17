// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape, FormattedHTMLMessage } from 'react-intl';
import styles from './WalletAdd.scss';
import { MAX_ADA_WALLETS_COUNT } from '../../config/numbersConfig';

import SvgInline from 'react-svg-inline';
import logo from '../../assets/images/yoroi-logo-white.inline.svg';
import HorizontalFlexContainer from '../layout/HorizontalFlexContainer';

const messages = defineMessages({
  title: {
    id: 'wallet.add.dialog.title.label',
    defaultMessage: '!!!Add wallet',
  },
  subTitle: {
    id: 'wallet.add.dialog.subtitle.label',
    defaultMessage: '!!!Yoroi light wallet for Cardano',
  },
  createDescription: {
    id: 'wallet.add.dialog.create.description',
    defaultMessage: '!!!Create wallet',
  },
  connectToHardwareDescription: {
    id: 'wallet.add.dialog.hardware.description',
    defaultMessage: '!!!Connect to hardware wallet',
  },
  useLedgerDescription: {
    id: 'wallet.add.dialog.ledger.description',
    defaultMessage: '!!!Connect to Ledger',
  },
  restoreDescription: {
    id: 'wallet.add.dialog.restore.description',
    defaultMessage: '!!!Restore wallet',
  },
  restorePaperDescription: {
    id: 'wallet.add.dialog.restore.paper.description',
    defaultMessage: '!!!Restore Yoroi Paper Wallet',
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
  classicTheme: boolean,
  title: string,
  subTitle: string,
};

@observer
export default class WalletAdd extends Component<Props> {
  static contextTypes = {
    intl: intlShape.isRequired,
  };

  render() {
    const { intl } = this.context;
    const {
      isCreateTrezorWalletActive,
      onLedger,
      isCreateLedgerWalletActive,
      onCreate,
      onRestore,
      isRestoreActive,
      classicTheme,
      title,
    } = this.props;

    let activeNotification = null;
    if (isCreateTrezorWalletActive) {
      activeNotification = 'createTrezorWalletNotificationMessage';
    } else if (isCreateLedgerWalletActive) {
      activeNotification = 'createLedgerWalletNotificationMessage';
    } else if (isRestoreActive) {
      activeNotification = 'restoreNotificationMessage';
    }

    return (
      <div className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroLeft}>
            <SvgInline svg={logo} className={styles.heroLogo} />
            <h2 className={styles.title}>{title}</h2>
            <h3 className={styles.subTitle}>{intl.formatMessage(messages.subTitle)}</h3>
          </div>
          <HorizontalFlexContainer>
            {/* eslint-disable */}
            <div className={styles.itemCard} tabIndex="0" role="button" onClick={onCreate}>
              <div className={`${styles.itemCardBg} ${styles.create}`} />
              <h3 className={styles.itemCardTitle}>{intl.formatMessage(messages.createDescription)}</h3>
            </div>
            <div className={styles.itemCard} tabIndex="0" role="button" onClick={onRestore}>
              <div className={`${styles.itemCardBg} ${styles.restore}`} />
              <h3 className={styles.itemCardTitle}>{intl.formatMessage(messages.restoreDescription)}</h3>
            </div>
            <div className={styles.itemCard} tabIndex="0" role="button" onClick={onLedger}>
              <div className={`${styles.itemCardBg} ${styles.connect}`} />
              <h3 className={styles.itemCardTitle}>{intl.formatMessage(messages.connectToHardwareDescription)}</h3>
            </div>
            {/* eslint-enable */}
            {activeNotification ? (
              <div className={styles.notification}>
                <FormattedHTMLMessage
                  {...messages[activeNotification]}
                  values={{ maxWalletsCount: MAX_ADA_WALLETS_COUNT }}
                />
              </div>
            ) : null}
          </HorizontalFlexContainer>
        </div>

        {!classicTheme && <div className={styles.heroBg} />}
      </div>
    );
  }

}
