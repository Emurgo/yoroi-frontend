// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import classnames from 'classnames';
import styles from './TopBarLayout.scss';

type Props = {|
  banner?: Node,
  topbar?: Node,
  children?: ?Node,
  notification?: ?Node,
  languageSelectionBackground?: boolean,
  footer?: Node,
  classicTheme?: boolean,
|};

/** Adds a top bar above the wrapped node */
@observer
export default class TopBarLayout extends Component<Props> {
  static defaultProps = {
    banner: undefined,
    topbar: undefined,
    children: undefined,
    notification: undefined,
    languageSelectionBackground: false,
    footer: undefined,
    classicTheme: false,
  };

  render() {
    const {
      banner,
      topbar,
      children,
      notification,
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

          {topbar && (
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
