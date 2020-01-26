// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';
import styles from './ReceiveNavigation.scss';

import AttentionIcon from '../../../assets/images/attention-modern.inline.svg';
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
            label={intl.formatMessage(messages.externalTab)}
            isActive={isActiveTab('external')}
            onClick={() => onTabClick('external')}
          />
          <ReceiveNavButton
            label={intl.formatMessage(messages.internalTab)}
            icon={AttentionIcon}
            isActive={isActiveTab('internal')}
            onClick={() => onTabClick('internal')}
          />
        </div>
      </div>
    );
  }
}
