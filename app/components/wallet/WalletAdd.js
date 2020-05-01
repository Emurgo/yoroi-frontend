// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape, FormattedHTMLMessage } from 'react-intl';
import classnames from 'classnames';

import CustomTooltip from '../widgets/CustomTooltip';
import MainCards from './add/MainCards';
import LogoYoroiIcon from '../../assets/images/yoroi-logo-white.inline.svg';
import LogoYoroiShelleyTestnetIcon from '../../assets/images/yoroi-logo-shelley-testnet-white.inline.svg';
import SettingsIcon from '../../assets/images/top-bar/setting-active.inline.svg';
import DaedalusIcon from '../../assets/images/top-bar/daedalus-migration.inline.svg';
import NightlyLogo from '../../assets/images/yoroi-logo-nightly-white.inline.svg';

import styles from './WalletAdd.scss';

import environment from '../../environment';

const messages = defineMessages({
  title: {
    id: 'wallet.add.page.title',
    defaultMessage: '!!!Your gateway to the financial world',
  },
  subTitle: {
    id: 'wallet.add.page.subtitle.label',
    defaultMessage: '!!!Yoroi light wallet for Cardano',
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
|};

@observer
export default class WalletAdd extends Component<Props> {
  static contextTypes = {
    intl: intlShape.isRequired,
  };

  getLogo: void => string = () => {
    if (environment.isNightly()) {
      return NightlyLogo;
    }
    if (environment.isShelley()) {
      return LogoYoroiShelleyTestnetIcon;
    }
    return LogoYoroiIcon;
  }

  render() {
    const { intl } = this.context;
    const {
      onSettings,
      onDaedalusTransfer,
    } = this.props;

    const componentStyle = classnames([
      styles.component,
      environment.isShelley() ? styles.shelleyTestnet : null
    ]);

    const LogoIcon = this.getLogo();

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
              <MainCards
                onCreate={this.props.onCreate}
                onRestore={this.props.onRestore}
                onHardwareConnect={this.props.onHardwareConnect}
              />
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
                  <div className={styles.tooltip}>
                    <CustomTooltip
                      toolTip={
                        <div><FormattedHTMLMessage {...messages.transferFundsTooltip} /></div>
                      }
                    />
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
