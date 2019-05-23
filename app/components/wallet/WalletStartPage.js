// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape, FormattedHTMLMessage } from 'react-intl';
import styles from './WalletAdd.scss';
import { MAX_ADA_WALLETS_COUNT } from '../../config/numbersConfig';

import SvgInline from 'react-svg-inline';
import logoIcon from '../../assets/images/yoroi-logo-white.inline.svg';
import settingsIcon from '../../assets/images/top-bar/setting-active.inline.svg';
import daedalusIcon from '../../assets/images/top-bar/daedalus-migration-active.inline.svg';

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
});

type Props = {
  onCreate: Function,
  onRestore: Function,
  onHardwareConnect: Function,
  isRestoreActive: boolean,
  classicTheme: boolean,
  title: string,
  subTitle: string,
};

@observer
export default class WalletStartPage extends Component<Props> {
  static contextTypes = {
    intl: intlShape.isRequired,
  };

  render() {
    const { intl } = this.context;
    const {
      onCreate,
      onRestore,
      onHardwareConnect,
      isRestoreActive,
      classicTheme,
      title,
    } = this.props;

    let activeNotification = null;
    if (isRestoreActive) {
      activeNotification = 'restoreNotificationMessage';
    }

    return (
      <div className={styles.hero}>
        {/* start page settings bar start */}
        <div className={styles.settingsBar}>
          <a href="main_window.html#/daedalus-transfer" className={styles.settingsBarLink}>
            <SvgInline svg={daedalusIcon} width="45" height="40" />
          </a>
          <a href="main_window.html#/settings" className={styles.settingsBarLink}>
            <SvgInline svg={settingsIcon} width="30" height="30" />
          </a>
        </div>
        {/* start page settings bar end */}
        <div className={styles.heroInner}>
          <div className={styles.heroLeft}>
            <SvgInline svg={logoIcon} className={styles.heroLogo} />
            <h2 className={styles.title}>{title}</h2>
            <h3 className={styles.subTitle}>{intl.formatMessage(messages.subTitle)}</h3>
          </div>
          <div className={styles.cardList}>
            <button type="button" onClick={onCreate}>
              <div className={styles.itemCard}>
                <div className={`${styles.itemCardBg} ${styles.create}`} />
                <h3 className={styles.itemCardTitle}>
                  {intl.formatMessage(messages.createDescription)}
                </h3>
              </div>
            </button>
            <button type="button" onClick={onRestore}>
              <div className={styles.itemCard}>
                <div className={`${styles.itemCardBg} ${styles.restore}`} />
                <h3 className={styles.itemCardTitle}>
                  {intl.formatMessage(messages.restoreDescription)}
                </h3>
              </div>
            </button>
            <button type="button" onClick={onHardwareConnect}>
              <div className={styles.itemCard}>
                <div className={`${styles.itemCardBg} ${styles.connect}`} />
                <h3 className={styles.itemCardTitle}>
                  {intl.formatMessage(messages.connectToHardwareDescription)}
                </h3>
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
        </div>
        {!classicTheme && <div className={styles.heroBg} />}
      </div>
    );
  }

}
