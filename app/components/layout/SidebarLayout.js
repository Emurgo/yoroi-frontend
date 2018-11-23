// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import { intlShape, defineMessages, FormattedMessage } from 'react-intl';
import globalMessages from '../../i18n/global-messages';
import { handleExternalLinkClick } from '../../utils/routing';
import styles from './SidebarLayout.scss';
import environment from '../../environment';

type Props = {
  children?: Node,
  sidebar?: Node,
  topbar: Node,
  notification?: ?Node,
  contentDialogs?: ?Array<Node>,
};

export const messages = defineMessages({
  testnetLabel: {
    id: 'testnet.label.message',
    defaultMessage: '!!!Warning: This is a testnet. ADA on the testnet has no monetary value. For more information, check out the FAQ at {faqLink}',
    description: 'Message alerting users the wallet is not running in mainnet.'
  },
});

@observer
export default class SidebarLayout extends Component<Props> {
  static defaultProps = {
    children: undefined,
    sidebar: undefined,
    notification: undefined,
    contentDialogs: undefined
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
        href={intl.formatMessage(globalMessages.faqLinkUrl)}
        onClick={event => handleExternalLinkClick(event)}
      >
        {intl.formatMessage(globalMessages.faqLinkUrl)}
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
