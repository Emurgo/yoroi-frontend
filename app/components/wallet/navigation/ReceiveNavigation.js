// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';
import styles from './ReceiveNavigation.scss';

import transactionsIcon from '../../../assets/images/wallet-nav/tab-transactions.inline.svg';
import sendIcon from '../../../assets/images/wallet-nav/tab-send.inline.svg';
import ReceiveNavButton from './ReceiveNavButton';

const messages = defineMessages({
  internalTab: {
    id: 'wallet.receive.nav.internal',
    defaultMessage: '!!!Internal',
  },
  externalTab: {
    id: 'wallet.receive.nav.external',
    defaultMessage: '!!!External',
  },
});

type Props = {|
  +isActiveTab: ('internal' | 'external') => boolean,
  +onTabClick: string => void,
|};

@observer
export default class ReceiveNavigation extends Component<Props> {

  static contextTypes = {
    intl: intlShape.isRequired,
  };

  render() {
    const { isActiveTab, onTabClick } = this.props;
    const { intl } = this.context;

    return (
      <div className={styles.wrapper}>
        <div className={styles.content}>
          <ReceiveNavButton
            className="summary"
            label={intl.formatMessage(messages.externalTab)}
            icon={transactionsIcon}
            isActive={isActiveTab('external')}
            onClick={() => onTabClick('external')}
          />
          <ReceiveNavButton
            className="send"
            label={intl.formatMessage(messages.internalTab)}
            icon={sendIcon}
            isActive={isActiveTab('internal')}
            onClick={() => onTabClick('internal')}
          />
        </div>
      </div>
    );
  }
}
