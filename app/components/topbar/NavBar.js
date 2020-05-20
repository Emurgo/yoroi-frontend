// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import styles from './NavBar.scss';

type Props = {|
  +children?: ?Node,
  +title: ?Node,
  +walletDetails?: ?Node,
  +button?: ?Node,
  +walletPlate?: ?Node,
|};

@observer
export default class NavBar extends Component<Props> {
  static defaultProps: {|button: void, children: void, walletDetails: void, walletPlate: void|} = {
    children: undefined,
    walletPlate: undefined,
    button: undefined,
    walletDetails: undefined,
  };

  render(): Node {
    const {
      title,
      children,
      walletDetails,
    } = this.props;

    return (
      <header className={styles.navbar}>
        <div className={styles.title}>
          {title}
        </div>
        <div className={styles.content}>
          {children}
          {this.props.walletPlate != null && (
            <div className={styles.plate}>
              {this.props.walletPlate}
            </div>
          )}
          {this.props.button != null && (
            <div className={styles.button}>
              {this.props.button}
            </div>
          )}
          <div className={styles.details}>
            {walletDetails}
          </div>
        </div>
      </header>
    );
  }
}
