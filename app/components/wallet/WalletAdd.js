// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape, FormattedHTMLMessage } from 'react-intl';

import SvgInline from 'react-svg-inline';
import logoIcon from '../../assets/images/yoroi-logo-white.inline.svg';
import settingsIcon from '../../assets/images/top-bar/setting-active.inline.svg';
import daedalusIcon from '../../assets/images/top-bar/daedalus-migration.inline.svg';

import { MAX_ADA_WALLETS_COUNT } from '../../config/numbersConfig';
import styles from './WalletAdd.scss';

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
  restoreDescription: {
    id: 'wallet.add.dialog.restore.description',
    defaultMessage: '!!!Restore wallet',
  },
  restoreNotificationMessage: {
    id: 'wallet.add.dialog.restoreNotificationMessage',
    defaultMessage: '!!!Wallet restoration is currently in progress. Until it completes, it is not possible to restore or import new wallets.',
  },
  transferFundsTitle: {
    id: 'daedalusTransfer.wallet.add.page.link.label',
    defaultMessage: '!!!Transfer funds from Daedalus wallet to Yoroi',
  },
});

type Props = {
  onCreate: Function,
  onRestore: Function,
  onHardwareConnect: Function,
  onSettings: Function,
  onDaedalusTransfer: Function,
  isRestoreActive: boolean,
  title: string,
  subTitle: string,
  classicTheme: boolean,
};

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
      title,
    } = this.props;

    let activeNotification = null;
    if (isRestoreActive) {
      activeNotification = 'restoreNotificationMessage';
    }

    return (
      <div className={styles.heroWrapper}>
        <div className={styles.hero}>
          <div className={styles.settingsBar}>
            <button type="button" onClick={onSettings} className={styles.settingsBarLink}>
              <SvgInline svg={settingsIcon} width="30" height="30" />
            </button>
          </div>
          <div className={styles.heroInner}>
            <div className={styles.heroLeft}>
              <SvgInline svg={logoIcon} className={styles.heroLogo} />
              <h2 className={styles.heroTitle}>{title}</h2>
              <h3 className={styles.heroSubTitle}>{intl.formatMessage(messages.subTitle)}</h3>
            </div>
            <div className={styles.heroRight}>
              <div className={styles.heroCardsList}>
                <button type="button" onClick={onHardwareConnect}>
                  <div className={styles.heroCardsItem}>
                    <div className={`${styles.heroCardsItemBg} ${styles.connect}`} />
                    <div className={styles.heroCardsItemTitle}>
                      {intl.formatMessage(messages.connectToHardwareDescription)}
                    </div>
                  </div>
                </button>
                <button type="button" onClick={onCreate}>
                  <div className={styles.heroCardsItem}>
                    <div className={`${styles.heroCardsItemBg} ${styles.create}`} />
                    <div className={styles.heroCardsItemTitle}>
                      {intl.formatMessage(messages.createDescription)}
                    </div>
                  </div>
                </button>
                <button type="button" onClick={onRestore}>
                  <div className={styles.heroCardsItem}>
                    <div className={`${styles.heroCardsItemBg} ${styles.restore}`} />
                    <div className={styles.heroCardsItemTitle}>
                      {intl.formatMessage(messages.restoreDescription)}
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
              <button type="button" onClick={onDaedalusTransfer} className={`${styles.heroCardsItem} ${styles.heroCardsItemLink}`}>
                <SvgInline svg={daedalusIcon} width="45" height="40" className={styles.heroCardsItemLinkIcon} />
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
