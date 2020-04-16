// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import classNames from 'classnames';
import styles from './NotificationMessage.scss';

type Props = {|
  +icon: string,
  +show: boolean,
  +children?: Node,
|};

@observer
export default class NotificationMessage extends Component<Props> {
  static defaultProps = {
    children: null
  };

  render() {
    const { icon, show, children } = this.props;

    const notificationMessageStyles = classNames([
      styles.component,
      show ? styles.show : null,
    ]);

    const SvgElem = icon;
    return (
      <div className={notificationMessageStyles}>

        {icon && <span className={styles.icon}><SvgElem /></span>}

        <div className={styles.message}>
          {children}
        </div>

      </div>
    );
  }

}
