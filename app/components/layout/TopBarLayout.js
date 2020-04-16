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
  +showAsCard?: boolean,
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
    showAsCard: false,
  };

  render() {
    const {
      banner,
      sidebar,
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
            {this.getContentUnderBanner()}
          </div>
        </div>
      </div>
    );
  }

  optionallyWrapInContainer: Node => Node = (content) => {
    const { showInContainer } = this.props;
    if (showInContainer === true) {
      return (
        <div
          className={
            classnames([
              styles.content,
              showInContainer !== null && showInContainer === true && styles.containerContent
            ])
          }
        >
          {content}
        </div>
      );
    }
    return content;
  }

  getContentUnderBanner: void => Node = () => {
    const {
      topbar,
      navbar,
      children,
      notification,
      showInContainer,
      showAsCard
    } = this.props;

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

    const content = (
      <>
        {topbar != null ? topbarComponent : null}
        {navbar != null ? navbarComponent : null}
        {notification}
        <div
          className={
            classnames([
              styles.inner,
              showInContainer !== null && showInContainer === true && styles.containerInner,
              showAsCard !== null && showAsCard === true && styles.containerCard
            ])
          }
        >
          <div className={styles.content}>
            {children}
          </div>
        </div>
      </>
    );

    return this.optionallyWrapInContainer(content);
  }
}
