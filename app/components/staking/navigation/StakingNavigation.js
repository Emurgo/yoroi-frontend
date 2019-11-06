// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';
import StakingNavButton from './StakingNavButton';
import summaryIcon from '../../../assets/images/wallet-nav/summary-ic.inline.svg';
import sendIcon from '../../../assets/images/wallet-nav/send-ic.inline.svg';
import receiveIcon from '../../../assets/images/wallet-nav/receive-ic.inline.svg';

import styles from './StakingNavigation.scss';

const messages = defineMessages({
  dashboard: {
    id: 'staking.navigation.dashboard',
    defaultMessage: '!!!Dashboard',
  },
  simulator: {
    id: 'staking.navigation.simulator',
    defaultMessage: '!!!Simple staking simulator',
  },
  advancedSimulator: {
    id: 'staking.navigation.advancedSimulator',
    defaultMessage: '!!!Advanced staking simulator',
  },
});

type Props = {|
  isActiveNavItem: string => boolean,
  onNavItemClick: string => void,
|};

@observer
export default class StakingNavigation extends Component<Props> {

  static contextTypes = {
    intl: intlShape.isRequired,
  };

  render() {
    const { isActiveNavItem, onNavItemClick } = this.props;
    const { intl } = this.context;
    return (
      <div className={styles.component}>

        <div className={styles.navItem}>
          <StakingNavButton
            className="dashboard"
            label={intl.formatMessage(messages.dashboard)}
            icon={summaryIcon}
            isActive={isActiveNavItem('dashboard')}
            onClick={() => onNavItemClick('dashboard')}
          />
        </div>

        <div className={styles.navItem}>
          <StakingNavButton
            className="simulator"
            label={intl.formatMessage(messages.simulator)}
            icon={sendIcon}
            isActive={isActiveNavItem('simulator')}
            onClick={() => onNavItemClick('simulator')}
          />
        </div>

        <div className={styles.navItem}>
          <StakingNavButton
            className="advanced-simulator"
            label={intl.formatMessage(messages.advancedSimulator)}
            icon={receiveIcon}
            isActive={isActiveNavItem('advanced-simulator')}
            onClick={() => onNavItemClick('advanced-simulator')}
          />
        </div>

      </div>
    );
  }
}
