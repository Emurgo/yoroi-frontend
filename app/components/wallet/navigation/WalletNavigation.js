// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';
import styles from './WalletNavigation.scss';
import WalletNavButton from './WalletNavButton';
import environment from '../../../environment';
import summaryIcon from '../../../assets/images/wallet-nav/summary-ic.inline.svg';
import sendIcon from '../../../assets/images/wallet-nav/send-ic.inline.svg';
import receiveIcon from '../../../assets/images/wallet-nav/receive-ic.inline.svg';

const messages = defineMessages({
  transactions: {
    id: 'wallet.navigation.transactions',
    defaultMessage: '!!!Transactions',
  },
  send: {
    id: 'wallet.navigation.send',
    defaultMessage: '!!!Send',
  },
  receive: {
    id: 'wallet.navigation.receive',
    defaultMessage: '!!!Receive',
  },
  stakeDashboard: {
    id: 'wallet.navigation.stakeDashboard',
    defaultMessage: '!!!Dashboard',
  },
  stakeAdvancedSimulator: {
    id: 'wallet.navigation.stakeAdvancedSimulator',
    defaultMessage: '!!!Advanced staking simulator',
  },
  stakeSimulator: {
    id: 'wallet.navigation.stakeSimulator',
    defaultMessage: '!!!Simple staking simulator',
  },
});

type Props = {|
  isActiveNavItem: string => boolean,
  onNavItemClick: string => void,
|};

@observer
export default class WalletNavigation extends Component<Props> {

  static contextTypes = {
    intl: intlShape.isRequired,
  };

  render() {
    const { isActiveNavItem, onNavItemClick } = this.props;
    const { intl } = this.context;

    let navItems = undefined;
    if (environment.isShelley()) {
      navItems = (
        <>
          <div className={styles.navItem}>
            <WalletNavButton
              className="stakeDashboard"
              label={intl.formatMessage(messages.stakeDashboard)}
              icon={summaryIcon}
              isActive={isActiveNavItem('stake-dashboard')}
              onClick={() => onNavItemClick('stake-dashboard')}
            />
          </div>

          <div className={styles.navItem}>
            <WalletNavButton
              className="stakeSimulator"
              label={intl.formatMessage(messages.stakeSimulator)}
              icon={sendIcon}
              isActive={isActiveNavItem('stake-simulator')}
              onClick={() => onNavItemClick('stake-simulator')}
            />
          </div>

          <div className={styles.navItem}>
            <WalletNavButton
              className="stakeAdvancedSimulator"
              label={intl.formatMessage(messages.stakeAdvancedSimulator)}
              icon={receiveIcon}
              isActive={isActiveNavItem('stake-advanced-simulator')}
              onClick={() => onNavItemClick('stake-advanced-simulator')}
            />
          </div>
        </>
      );
    } else {
      navItems = (
        <>
          <div className={styles.navItem}>
            <WalletNavButton
              className="summary"
              label={intl.formatMessage(messages.transactions)}
              icon={summaryIcon}
              isActive={isActiveNavItem('transactions')}
              onClick={() => onNavItemClick('transactions')}
            />
          </div>

          <div className={styles.navItem}>
            <WalletNavButton
              className="send"
              label={intl.formatMessage(messages.send)}
              icon={sendIcon}
              isActive={isActiveNavItem('send')}
              onClick={() => onNavItemClick('send')}
            />
          </div>

          <div className={styles.navItem}>
            <WalletNavButton
              className="receive"
              label={intl.formatMessage(messages.receive)}
              icon={receiveIcon}
              isActive={isActiveNavItem('receive')}
              onClick={() => onNavItemClick('receive')}
            />
          </div>
        </>
      );
    }

    return (
      <div className={styles.component}>
        {navItems}
      </div>
    );
  }
}
