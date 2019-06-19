// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape, FormattedHTMLMessage } from 'react-intl';
import classnames from 'classnames';

import SvgInline from 'react-svg-inline';
import logoIcon from '../../assets/images/yoroi-logo-white.inline.svg';
import settingsIcon from '../../assets/images/top-bar/setting-active.inline.svg';
import daedalusIcon from '../../assets/images/top-bar/daedalus-migration.inline.svg';

import { MAX_ADA_WALLETS_COUNT } from '../../config/numbersConfig';
import styles from './WalletAdd.scss';

const messages = defineMessages({
  title: {
    id: 'wallet.add.page.title',
    defaultMessage: '!!!Gateway to the financial world',
  },
  subTitle: {
    id: 'wallet.add.page.subtitle.label',
    defaultMessage: '!!!Yoroi light wallet for Cardano',
  },
  connectToHWTitle: {
    id: 'wallet.add.page.hw.title',
    defaultMessage: '!!!Connect to hardware wallet',
  },
  createTitle: {
    id: 'wallet.add.page.create.title',
    defaultMessage: '!!!Create wallet',
  },
  restoreTitle: {
    id: 'wallet.add.page.restore.title',
    defaultMessage: '!!!Restore wallet',
  },
  transferFundsTitle: {
    id: 'wallet.add.page.daedalusTransfer.title',
    defaultMessage: '!!!Transfer funds from a Daedalus wallet to Yoroi',
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
  },
});

type Props = {|
  onCreate: Function,
  onRestore: Function,
  onHardwareConnect: Function,
  onSettings: Function,
  onDaedalusTransfer: Function,
  isRestoreActive: boolean,
  classicTheme: boolean,
|};

@observer
export default class WalletAdd extends Component<Props> {
  static contextTypes = {
    intl: intlShape.isRequired,
  };

  render() {
    const { intl } = this.context;
    const {
      onCreate,
      onRestore,
      onHardwareConnect,
      onSettings,
      onDaedalusTransfer,
      isRestoreActive,
    } = this.props;

    let activeNotification = null;
    if (isRestoreActive) {
      activeNotification = 'restoreNotificationMessage';
    }

    return (
      <div className={styles.component}>
        {/* Setting button */}
        <div className={styles.hero}>
          <div className={styles.settingsBar}>
            <button type="button" onClick={onSettings} className={styles.settingsBarLink}>
              <SvgInline svg={settingsIcon} width="30" height="30" />
            </button>
          </div>

          <div className={styles.heroInner}>
            {/* Left block  */}
            <div className={styles.heroLeft}>
              <SvgInline svg={logoIcon} className={styles.heroLogo} />
              <h2 className={styles.heroTitle}>
                <FormattedHTMLMessage {...(messages.title)} />
              </h2>
              <h3 className={styles.heroSubTitle}>{intl.formatMessage(messages.subTitle)}</h3>
            </div>
            {/* Right block  */}
            <div className={styles.heroRight}>
              <div className={styles.heroCardsList}>
                {/* Connect to hardware wallet */}
                <button
                  type="button"
                  className="WalletAdd_btnConnectHW"
                  onClick={onHardwareConnect}
                >
                  <div className={styles.heroCardsItem}>
                    <div className={classnames([styles.heroCardsItemBg, styles.bgConnectHW])} />
                    <div className={styles.heroCardsItemTitle}>
                      {intl.formatMessage(messages.connectToHWTitle)}
                    </div>
                  </div>
                </button>
                {/* Create wallet */}
                <button
                  type="button"
                  className="WalletAdd_btnCreateWallet"
                  onClick={onCreate}
                >
                  <div className={styles.heroCardsItem}>
                    <div className={classnames([styles.heroCardsItemBg, styles.bgCreateWallet])} />
                    <div className={styles.heroCardsItemTitle}>
                      {intl.formatMessage(messages.createTitle)}
                    </div>
                  </div>
                </button>
                {/* Restore wallet */}
                <button
                  type="button"
                  className="WalletAdd_btnRestoreWallet"
                  onClick={onRestore}
                >
                  <div className={styles.heroCardsItem}>
                    <div
                      className={classnames([styles.heroCardsItemBg, styles.bgRestoreWallet])}
                    />
                    <div className={styles.heroCardsItemTitle}>
                      {intl.formatMessage(messages.restoreTitle)}
                    </div>
                  </div>
                </button>
                {activeNotification ? (
                  <div className={styles.notification}>
                    <FormattedHTMLMessage
                      {...messages[activeNotification]}
                      values={{ maxWalletsCount: MAX_ADA_WALLETS_COUNT }}
                    />
                  </div>
                ) : null}
              </div>
              {/* Transfer funds from a Daedalus wallet to Yoroi */}
              <button
                type="button"
                onClick={onDaedalusTransfer}
                className={classnames([styles.heroCardsItem, styles.heroCardsItemLink])}
              >
                <SvgInline
                  svg={daedalusIcon}
                  width="45"
                  height="40"
                  className={styles.heroCardsItemLinkIcon}
                />
                <div className={styles.heroCardsItemTitle}>
                  {intl.formatMessage(messages.transferFundsTitle)}
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

}
