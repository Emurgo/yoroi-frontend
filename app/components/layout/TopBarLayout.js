// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import classnames from 'classnames';
import Footer from '../footer/Footer';
import styles from './TopBarLayout.scss';

type Props = {
  topbar: Node,
  children?: ?Node,
  notification?: ?Node,
  banner?: Node,
  isTopBarVisible?: boolean,
  isBannerVisible?: boolean,
  languageSelectionBackground?: boolean,
  withFooter? : boolean,
  oldTheme?: boolean
};

/** Adds a top bar above the wrapped node */
@observer
export default class TopBarLayout extends Component<Props> {
  static defaultProps = {
    children: undefined,
    notification: undefined,
    banner: undefined,
    isTopBarVisible: true,
    isBannerVisible: true,
    languageSelectionBackground: false,
    withFooter: false,
    oldTheme: false
  };

  render() {
    const {
      banner,
      children,
      topbar,
      notification,
      isTopBarVisible,
      isBannerVisible,
      languageSelectionBackground,
      withFooter,
      oldTheme
    } = this.props;
    const componentClasses = classnames([
      styles.component,
      languageSelectionBackground && !oldTheme ? styles.languageSelectionBackground : '',
    ]);
    const topbarClasses = classnames([
      oldTheme ? styles.topbarOld : styles.topbar,
    ]);
    const contentClasses = classnames([
      styles.content,
      withFooter ? styles.contentFooter : ''
    ]);

    return (
      <div className={componentClasses}>
        <div className={styles.main}>
          {isTopBarVisible ? (
            <div className={topbarClasses}>
              {topbar}
            </div>
          ) : null}

          {isBannerVisible && banner}

          {notification}
          <div className={styles.contentWrapper}>
            <div className={contentClasses}>
              {children}
            </div>
          </div>

          {withFooter && <Footer />}
        </div>
      </div>
    );
  }
}
