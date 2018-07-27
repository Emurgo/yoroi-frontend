// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import { intlShape, defineMessages } from 'react-intl';
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
                {intl.formatMessage(messages.testnetLabel)}
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
