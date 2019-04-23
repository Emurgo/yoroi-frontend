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
  noTopbarNoBanner?: boolean,
  languageSelectionBackground?: boolean,
  isClassicThemeActive?: boolean,
  footer?: Node,
};

/** Adds a top bar above the wrapped node */
@observer
export default class TopBarLayout extends Component<Props> {
  static defaultProps = {
    children: undefined,
    notification: undefined,
    banner: undefined,
    noTopbarNoBanner: undefined,
    languageSelectionBackground: false,
    withFooter: false,
    isClassicThemeActive: false,
    footer: undefined,
  };

  render() {
    const {
      banner,
      children,
      topbar,
      notification,
      noTopbarNoBanner,
      languageSelectionBackground,
      footer,
      isClassicThemeActive
    } = this.props;
    const componentClasses = classnames([
      styles.component,
      languageSelectionBackground && !isClassicThemeActive ? styles.languageSelectionBackground : '',
    ]);
    const topbarClasses = classnames([
      isClassicThemeActive ? styles.topbarClassic : styles.topbar,
    ]);
    const contentClasses = classnames([
      styles.content,
      footer ? styles.contentWithFooter : null,
    ]);

    return (
      <div className={componentClasses}>
        <div className={styles.main}>
          {noTopbarNoBanner ? null : (
            <div className={topbarClasses}>
              {topbar}
            </div>
          )}

          {noTopbarNoBanner ? null : banner}

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
