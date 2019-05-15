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
  hideTopbar?: boolean,
  languageSelectionBackground?: boolean,
  classicTheme?: boolean,
  footer?: Node,
};

/** Adds a top bar above the wrapped node */
@observer
export default class TopBarLayout extends Component<Props> {
  static defaultProps = {
    children: undefined,
    notification: undefined,
    banner: undefined,
    hideTopbar: undefined,
    languageSelectionBackground: false,
    withFooter: false,
    classicTheme: false,
    footer: undefined,
  };

  render() {
    const {
      banner,
      children,
      topbar,
      notification,
      hideTopbar,
      languageSelectionBackground,
      footer,
      classicTheme
    } = this.props;
    const componentClasses = classnames([
      styles.component,
      languageSelectionBackground && !classicTheme ? styles.languageSelectionBackground : '',
    ]);
    const contentClasses = classnames([
      styles.content,
      footer ? styles.contentWithFooter : null,
    ]);

    return (
      <div className={componentClasses}>
        <div className={styles.main}>

          {banner}

          {hideTopbar ? null : (
            <div className={styles.topbar}>
              {topbar}
            </div>
          )}

          {notification}

          <div className={styles.contentWrapper}>
            <div className={contentClasses}>
              {children}
            </div>
          </div>

          {footer ? (
            <div className={styles.footer}>
              {footer}
            </div>
          ) : null}
        </div>
      </div>
    );
  }
}
