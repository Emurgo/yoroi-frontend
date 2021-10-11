// @flow
import React, { Component } from 'react';
import type { Node, ComponentType } from 'react';
import { observer } from 'mobx-react';
import classnames from 'classnames';
import styles from './NavBarRevamp.scss';
import { withLayout } from '../../themes/context/layout';
import NoticeBoardIcon from '../../assets/images/notice-board/notice-board.inline.svg';

type Props = {|
  +children?: ?Node,
  +title: ?Node,
  +walletDetails?: ?Node,
  +goToNotifications?: ?Function,
  +buyButton?: Node,
  +menu?: ?Node,
|};
type InjectProps = {| isRevampLayout: boolean |};

@observer
class NavBarRevamp extends Component<Props & InjectProps> {
  static defaultProps: {|
    children: void,
    walletDetails: void,
    goToNotifications: void,
    buyButton: void,
    menu: void,
  |} = {
    children: undefined,
    goToNotifications: undefined,
    walletDetails: undefined,
    buyButton: undefined,
    menu: undefined,
  };

  render(): Node {
    const { title, children, walletDetails, menu } = this.props;
    return (
      <header
        className={classnames([styles.navbarRevamp, menu != null && styles.navbarRevampWithMenu])}
      >
        <div className={styles.mainRevamp}>
          <div className={styles.title}>{title}</div>
          <div className={styles.content}>
            {children}
            {this.props.walletDetails != null && (
              <div className={styles.details}>{walletDetails}</div>
            )}
            <div className={styles.notifications}>
              <button type="button" onClick={this.props.goToNotifications}>
                <NoticeBoardIcon />
              </button>
            </div>
            {this.props.buyButton != null && (
              <div className={styles.buyButton}>{this.props.buyButton}</div>
            )}
          </div>
        </div>
        {menu != null ? <div className={styles.menu}>{menu}</div> : null}
      </header>
    );
  }
}
export default (withLayout(NavBarRevamp): ComponentType<Props>);
