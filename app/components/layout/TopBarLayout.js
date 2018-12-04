// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import styles from './TopBarLayout.scss';

type Props = {
  topbar: Node,
  children?: ?Node,
  notification?: ?Node,
  banner?: Node
};

/** Adds a top bar above the wrapped node */
@observer
export default class TopBarLayout extends Component<Props> {
  static defaultProps = {
    children: undefined,
    notification: undefined,
    banner: undefined
  };

  render() {
    const { banner, children, topbar, notification } = this.props;
    return (
      <div className={styles.component}>
        <div className={styles.main}>
          <div className={styles.topbar}>
            {topbar}
          </div>

          {banner}

          {notification}
          <div className={styles.contentWrapper}>
            <div className={styles.content}>
              {children}
            </div>
          </div>
        </div>
      </div>
    );
  }
}
