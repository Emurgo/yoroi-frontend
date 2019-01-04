// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import classNames from 'classnames';
import styles from './TopBarLayout.scss';

type Props = {
  topbar: Node,
  children?: ?Node,
  notification?: ?Node,
  banner?: Node,
  footer?: Node,
};

/** Adds a top bar above the wrapped node */
@observer
export default class TopBarLayout extends Component<Props> {
  static defaultProps = {
    children: undefined,
    notification: undefined,
    banner: undefined,
    footer: undefined,
  };

  render() {
    const {
      banner,
      children,
      topbar,
      notification,
      footer
    } = this.props;

    const contentStyle = classNames([
      styles.content,
      (footer) ? styles.contentWithFooter : null,
    ]);

    return (
      <div className={styles.component}>
        <div className={styles.main}>
          <div className={styles.topbar}>
            {topbar}
          </div>

          {banner}

          {notification}

          <div className={styles.contentWrapper}>
            <div className={contentStyle}>
              {children}
            </div>
          </div>

          {footer &&
            <div className={styles.footer}>
              {footer}
            </div>}
        </div>
      </div>
    );
  }
}
