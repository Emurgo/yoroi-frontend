// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';
import styles from './TransferNavigation.scss';
import TransferNavButton from './TransferNavButton';

const messages = defineMessages({
  fromDaedalus: {
    id: 'transfer.navigation.fromDaedalus',
    defaultMessage: '!!!Transfer funds from Daedalus',
  },
  fromYoroi: {
    id: 'transfer.navigation.fromYoroi',
    defaultMessage: '!!!Transfer funds from another wallet',
  },
});

type Props = {|
  isActiveNavItem: Function,
  onNavItemClick: Function,
|};

@observer
export default class TransferNavigation extends Component<Props> {

  static contextTypes = {
    intl: intlShape.isRequired,
  };

  render() {
    const { isActiveNavItem, onNavItemClick } = this.props;
    const { intl } = this.context;
    return (
      <div className={styles.component}>

        <div className={styles.navItem}>
          <TransferNavButton
            className="from-daedalus"
            label={intl.formatMessage(messages.fromDaedalus)}
            icon={null}
            isActive={isActiveNavItem('daedalus')}
            onClick={() => onNavItemClick('daedalus')}
          />
        </div>

        <div className={styles.navItem}>
          <TransferNavButton
            className="from-yoroi"
            label={intl.formatMessage(messages.fromYoroi)}
            icon={null}
            isActive={isActiveNavItem('yoroi')}
            onClick={() => onNavItemClick('yoroi')}
          />
        </div>

      </div>
    );
  }
}
