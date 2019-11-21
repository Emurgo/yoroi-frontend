// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import classnames from 'classnames';
import styles from './TopBarLayout.scss';

type Props = {|
  +banner?: Node,
  +topbar?: Node,
  +children?: ?Node,
  +notification?: ?Node,
  +languageSelectionBackground?: boolean,
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
  };

  render() {
    const {
      banner,
      topbar,
      children,
      notification,
    } = this.props;
    const componentClasses = classnames([
      styles.component,
      this.props.languageSelectionBackground === true
        ? styles.languageSelectionBackground
        : '',
    ]);

    return (
      <div className={componentClasses}>
        <div className={styles.main}>

          {banner}

          {topbar != null
            ? (
              <div className={styles.topbar}>
                {topbar}
              </div>
            )
            : null
          }

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
