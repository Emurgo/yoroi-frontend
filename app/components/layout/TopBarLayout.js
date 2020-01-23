// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import classnames from 'classnames';
import styles from './TopBarLayout.scss';

type Props = {|
  +banner?: Node,
  +topbar?: Node,
  +navbar?: Node,
  +sidebar?: Node,
  +children?: ?Node,
  +notification?: ?Node,
  +languageSelectionBackground?: boolean,
  +showInContainer?: boolean,
|};

/** Adds a top bar above the wrapped node */
@observer
export default class TopBarLayout extends Component<Props> {
  static defaultProps = {
    banner: undefined,
    topbar: undefined,
    navbar: undefined,
    sidebar: undefined,
    children: undefined,
    notification: undefined,
    languageSelectionBackground: false,
    showInContainer: false,
  };

  render() {
    const {
      banner,
      topbar,
      navbar,
      sidebar,
      children,
      notification,
      showInContainer,
    } = this.props;

    const componentClasses = classnames([
      styles.component,
      this.props.languageSelectionBackground === true
        ? styles.languageSelectionBackground
        : '',
    ]);

    const sidebarComponent = (
      <div className={styles.sidebar}>
        {sidebar}
      </div>
    );

    const topbarComponent = (
      <div className={styles.topbar}>
        {topbar}
      </div>
    );

    const navbarComponent = (
      <div className={styles.navbar}>
        {navbar}
      </div>
    );


    return (
      <div className={componentClasses}>
        <div className={styles.windowWrapper}>
          {sidebar != null ? sidebarComponent : null}
          <div
            className={
              classnames([
                styles.main,
                showInContainer !== null && showInContainer === true && styles.containerMain
              ])
            }
          >
            {banner}
            <div
              className={
                classnames([
                  styles.content,
                  showInContainer !== null && showInContainer === true && styles.containerContent
                ])
              }
            >
              {topbar != null ? topbarComponent : null}
              {navbar != null ? navbarComponent : null}
              {notification}
              <div
                className={
                  classnames([
                    styles.inner,
                    showInContainer !== null && showInContainer === true && styles.containerInner
                  ])
                }
              >
                <div className={styles.content}>
                  {children}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
