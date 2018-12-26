// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import classnames from 'classnames';
import styles from './TopBarLayout.scss';

type Props = {
  topbar: Node,
  children?: ?Node,
  notification?: ?Node,
  banner?: Node,
  isTopBarVisible: boolean,
  languageSelectionBackground?: boolean
};

/** Adds a top bar above the wrapped node */
@observer
export default class TopBarLayout extends Component<Props> {
  static defaultProps = {
    children: undefined,
    notification: undefined,
    banner: undefined,
    isTopBarVisible: true
  };

  render() {
    const { banner, children, topbar, notification, isTopBarVisible, languageSelectionBackground } = this.props;
    const componentClasses = classnames([
      styles.component,
      languageSelectionBackground ? styles.languageSelectionBackground : '',
    ]);

    return (
      <div className={componentClasses}>
        <div className={styles.main}>
          {isTopBarVisible ? (
            <div className={styles.topbar}>
              {topbar}
            </div>
          ) : null}

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
