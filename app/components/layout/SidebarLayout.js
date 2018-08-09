// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import { intlShape, defineMessages, FormattedMessage } from 'react-intl';
import styles from './SidebarLayout.scss';
import environment from '../../environment';

type Props = {
  children: any | Node,
  sidebar?: Node,
  topbar: Node,
  notification?: ?Node,
  contentDialogs?: ?Array<Node>,
};

export const messages = defineMessages({
  testnetLabel: {
    id: 'testnet.label.message',
    defaultMessage: '!!!Testnet',
    description: 'Message alerting users the wallet is not running in mainnet.'
  },
  faqLinkUrl: {
    id: 'settings.support.faq.faqLinkURL',
    defaultMessage: '!!!https://daedaluswallet.io/faq/',
    description: 'URL for the "FAQ on Yoroi website". link in the testnet banner',
  },
});

@observer
export default class SidebarLayout extends Component<Props> {

  static defaultProps = {
    children: null
  };

  static contextTypes = {
    intl: intlShape.isRequired,
  };

  render() {
    const {
      children, sidebar, topbar,
      notification, contentDialogs,
    } = this.props;

    const { intl } = this.context;

    const faqLink = (
      <a
        href={intl.formatMessage(messages.faqLinkUrl)}
        onClick={event => onExternalLinkClick(event)}
      >
        {intl.formatMessage(messages.faqLinkUrl)}
      </a>
    );

    return (
      <div className={styles.component}>
        {sidebar ? (
          <div className={styles.sidebar}>
            {sidebar}
          </div>
        ) : null}
        <div className={styles.main}>
          <div className={styles.topbar}>
            {topbar}
          </div>
          {
            environment.isMainnet() ? null : (
              <div className={styles.testnetWarning}>
                <FormattedMessage {...messages.testnetLabel} values={{ faqLink }} />
              </div>
            )
          }
          {notification}
          <div className={styles.contentWrapper}>
            <div className={styles.content}>
              {children}
            </div>
            {contentDialogs}
          </div>
        </div>
      </div>
    );
  }
}
