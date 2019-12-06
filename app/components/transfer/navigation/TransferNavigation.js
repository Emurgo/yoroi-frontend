// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';
import styles from './TransferNavigation.scss';
import TransferNavButton from './TransferNavButton';
import environment from '../../../environment';

const messages = defineMessages({
  fromDaedalus: {
    id: 'daedalusTransfer.title',
    defaultMessage: '!!!Transfer funds from Daedalus',
  },
  fromYoroi: {
    id: 'transfer.navigation.fromYoroi',
    defaultMessage: '!!!Transfer funds from another wallet',
  },
  fromLeagcyDaedalus: {
    id: 'daedalusTransfer.legacy.title',
    defaultMessage: '!!!Transfer funds from legacy Daedalus',
  },
});

type TransferNavigationPageName = 'daedalus' | 'yoroi';

export type TransferNavigationProps = {|
  isActiveNavItem: TransferNavigationPageName => boolean,
  onNavItemClick: TransferNavigationPageName => void,
|};

@observer
export default class TransferNavigation extends Component<TransferNavigationProps> {

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
            label={environment.isShelley()
              ? intl.formatMessage(messages.fromLeagcyDaedalus)
              : intl.formatMessage(messages.fromDaedalus)
            }
            isActive={isActiveNavItem('daedalus')}
            onClick={() => onNavItemClick('daedalus')}
          />
        </div>

        <div className={styles.navItem}>
          <TransferNavButton
            className="from-yoroi"
            label={intl.formatMessage(messages.fromYoroi)}
            isActive={isActiveNavItem('yoroi')}
            onClick={() => onNavItemClick('yoroi')}
          />
        </div>

      </div>
    );
  }
}
