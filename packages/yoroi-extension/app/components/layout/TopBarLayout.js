// @flow
import { Component } from 'react';
import type { Node, ComponentType } from 'react';
import { observer } from 'mobx-react';
import classnames from 'classnames';
import styles from './TopBarLayout.scss';
import { withLayout } from '../../styles/context/layout';

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

type InjectedProps = {| isRevampLayout: boolean |};
/** Adds a top bar above the wrapped node */
@observer
class TopBarLayout extends Component<Props & InjectedProps> {
  static defaultProps: {|
    banner: void,
    children: void,
    languageSelectionBackground: boolean,
    navbar: void,
    notification: void,
    showAsCard: boolean,
    showInContainer: boolean,
    sidebar: void,
    topbar: void,
  |} = {
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

  render(): Node {
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

  optionallyWrapInContainer: Node => Node = content => {
    const { showInContainer, isRevampLayout } = this.props;
    if (showInContainer === true) {
      return isRevampLayout ? (
        <div className={styles.containerContentRevamp}>{content}</div>
      ) : (
        <div
          className={
            classnames([
              styles.content,
              showInContainer === true && styles.containerContent
            ])
          }
        >
          {content}
        </div>
      );
    }
    return content;
  };

  getContentUnderBanner: void => Node = () => {
    const {
      topbar,
      navbar,
      children,
      notification,
      showInContainer,
      showAsCard,
      isRevampLayout,
    } = this.props;

    const topbarComponent = <div className={styles.topbar}>{topbar}</div>;

    const navbarComponent = <div className={styles.navbar}>{navbar}</div>;

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
          {isRevampLayout ? (
            <div className={styles.contentRevamp}>{children}</div>
          ) : (
            <div className={styles.content}>{children}</div>
          )}
        </div>
      </>
    );

    return this.optionallyWrapInContainer(content);
  };
}

export default (withLayout(TopBarLayout): ComponentType<Props>);
