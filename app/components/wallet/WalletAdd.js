// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape, FormattedHTMLMessage } from 'react-intl';
import classnames from 'classnames';

import CustomTooltip from '../widgets/CustomTooltip';
import LogoYoroiIcon from '../../assets/images/yoroi-logo-white.inline.svg';
import LogoYoroiShelleyTestnetIcon from '../../assets/images/yoroi-logo-shelley-testnet-white.inline.svg';
import SettingsIcon from '../../assets/images/top-bar/setting-active.inline.svg';
import DaedalusIcon from '../../assets/images/top-bar/daedalus-migration.inline.svg';

import styles from './WalletAdd.scss';

import environmnent from '../../environment';

const messages = defineMessages({
  title: {
    id: 'wallet.add.page.title',
    defaultMessage: '!!!Your gateway to the financial world',
  },
  subTitle: {
    id: 'wallet.add.page.subtitle.label',
    defaultMessage: '!!!Yoroi light wallet for Cardano',
  },
  connectToHWTitle: {
    id: 'wallet.add.page.hw.title',
    defaultMessage: '!!!Connect to hardware wallet',
  },
  connectToHWTooltip: {
    id: 'wallet.add.page.hw.tooltip',
    defaultMessage: '!!!Create or restore a Yoroi wallet<br/>using a Ledger or Trezor hardware wallet.',
  },
  createTitle: {
    id: 'wallet.add.page.create.title',
    defaultMessage: '!!!Create wallet',
  },
  createTooltip: {
    id: 'wallet.add.page.create.tooltip',
    defaultMessage: '!!!Generate a new 15-word recovery phrase<br/>and create a Yoroi wallet.',
  },
  restoreTitle: {
    id: 'wallet.add.page.restore.title',
    defaultMessage: '!!!Restore wallet',
  },
  restoreTooltip: {
    id: 'wallet.add.page.restore.tooltip',
    defaultMessage: '!!!Enter a 15-word recovery phrase<br/>to restore an already-existing Yoroi wallet,<br/>or import an existing Yoroi paper wallet.',
  },
  transferFundsTitle: {
    id: 'wallet.add.page.daedalusTransfer.title',
    defaultMessage: '!!!Transfer funds from a Daedalus wallet to Yoroi',
  },
  transferFundsTooltip: {
    id: 'wallet.add.page.daedalusTransfer.tooltip',
    defaultMessage: '!!!You can transfer funds from a Daedalus wallet<br/>to Yoroi, but first you will need to create<br/>a Yoroi wallet to store those funds.',
  },
});

type Props = {|
  +onCreate: void => void,
  +onRestore: void => void,
  +onHardwareConnect: void => void,
  +onSettings: void => void,
  +onDaedalusTransfer: void => void,
  +classicTheme: boolean,
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
    } = this.props;

    const componentStyle = classnames([
      styles.component,
      environmnent.isShelley() ? styles.shelleyTestnet : null
    ]);

    const LogoIcon = environmnent.isShelley() ? LogoYoroiShelleyTestnetIcon : LogoYoroiIcon;

    return (
      <div className={componentStyle}>
        {/* Setting button */}
        <div className={styles.hero}>
          <div className={styles.settingsBar}>
            <button type="button" onClick={onSettings} className={styles.settingsBarLink}>
              <SettingsIcon width="30" height="30" />
            </button>
          </div>

          <div className={styles.heroInner}>
            {/* Left block  */}
            <div className={styles.heroLeft}>
              <span className={styles.heroLogo}><LogoIcon width="156" height="50" /></span>
              <h2 className={styles.heroTitle}>
                <FormattedHTMLMessage {...(messages.title)} />
              </h2>
              <h3 className={styles.heroSubTitle}>{intl.formatMessage(messages.subTitle)}</h3>
            </div>
            {/* Right block  */}
            <div className={styles.heroRight}>
              <div className={styles.heroCardsList}>
                {/* Connect to hardware wallet */}
                {!environmnent.isShelley() &&
                  <button
                    type="button"
                    className="WalletAdd_btnConnectHW"
                    onClick={onHardwareConnect}
                  >
                    <div className={styles.heroCardsItem}>
                      <div className={classnames([styles.heroCardsItemBg, styles.bgConnectHW])} />
                      <div className={styles.heroCardsItemTitle}>
                        {intl.formatMessage(messages.connectToHWTitle)}
                        <CustomTooltip
                          toolTip={
                            <div><FormattedHTMLMessage {...messages.connectToHWTooltip} /></div>
                          }
                        />
                      </div>
                    </div>
                  </button>
                }
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
                      <CustomTooltip
                        toolTip={
                          <div><FormattedHTMLMessage {...messages.createTooltip} /></div>
                        }
                      />
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
                      <CustomTooltip
                        toolTip={
                          <div><FormattedHTMLMessage {...messages.restoreTooltip} /></div>
                        }
                      />
                    </div>
                  </div>
                </button>
              </div>
              {/* Transfer funds from a Daedalus wallet to Yoroi */}
              <button
                type="button"
                onClick={onDaedalusTransfer}
                className={classnames([styles.heroCardsItem, styles.heroCardsItemLink])}
              >
                <span className={styles.heroCardsItemLinkIcon}>
                  <DaedalusIcon width="45" height="40" />
                </span>
                <div className={styles.heroCardsItemTitle}>
                  {intl.formatMessage(messages.transferFundsTitle)}
                  <CustomTooltip
                    toolTip={
                      <div><FormattedHTMLMessage {...messages.transferFundsTooltip} /></div>
                    }
                  />
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

}
