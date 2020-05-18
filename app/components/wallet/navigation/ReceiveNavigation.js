// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';
import styles from './ReceiveNavigation.scss';
import globalMessages from '../../../i18n/global-messages';

import AttentionIcon from '../../../assets/images/attention-modern.inline.svg';
import ReceiveNavButton from './ReceiveNavButton';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';

const messages = defineMessages({
  externalTab: {
    id: 'wallet.receive.nav.external',
    defaultMessage: '!!!External',
  },
});

type Props = {|
  +isActiveTab: ('internal' | 'external' | 'mangled') => boolean,
  +onTabClick: string => void,
  +showMangled: boolean,
|};

@observer
export default class ReceiveNavigation extends Component<Props> {

  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };

  render(): Node {
    const { isActiveTab, onTabClick } = this.props;
    const { intl } = this.context;

    return (
      <div className={styles.wrapper}>
        <div className={styles.content}>
          <ReceiveNavButton
            className="external"
            label={intl.formatMessage(messages.externalTab)}
            isActive={isActiveTab('external')}
            onClick={() => onTabClick('external')}
          />
          <ReceiveNavButton
            className="internal"
            label={intl.formatMessage(globalMessages.internalLabel)}
            icon={AttentionIcon}
            isActive={isActiveTab('internal')}
            onClick={() => onTabClick('internal')}
          />
          {this.props.showMangled && (
            <ReceiveNavButton
              className="mangled"
              label={intl.formatMessage(globalMessages.mangledLabel)}
              icon={AttentionIcon}
              isActive={isActiveTab('mangled')}
              onClick={() => onTabClick('mangled')}
            />
          )}
        </div>
      </div>
    );
  }
}
