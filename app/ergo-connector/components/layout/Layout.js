// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import YoroiLogo from '../../assets/images/yoroi_logo.inline.svg';
import MenuIcon from '../../assets/images/menu_icon.inline.svg';
import ArrowBack from '../../assets/images/arrow_back.inline.svg';
import styles from './Layout.scss';
import { observer } from 'mobx-react';
import SidebarContainer from '../../containers/SidebarContainer';

type Props = {|
  children: Node,
|};

type State = {|
  isMenuOpen: boolean,
|};

@observer
export default class Layout extends Component<Props, State> {
  state: State = { isMenuOpen: false };

  toggleMenu: () => void = () => {
    this.setState(prev => ({
      isMenuOpen: !prev.isMenuOpen,
    }));
  };
  render(): Node {
    const { isMenuOpen } = this.state;
    return (
      <div className={styles.layout}>
        <div className={styles.header}>
          {isMenuOpen ? (
            <button type="button" onClick={this.toggleMenu} className={styles.menuIcon}>
              <ArrowBack />
            </button>
          ) : (
            <button type="button" onClick={this.toggleMenu} className={styles.menuIcon}>
              <MenuIcon />
            </button>
          )}
          <div className={styles.menu}>
            {isMenuOpen ? (
              <p className={styles.setting}>Settings</p>
            ) : (
              <>
                <YoroiLogo />
                <div className={styles.logo}>
                  <h3>Yoroi Dapp Connector</h3>
                  <p className={styles.poweredBy}>Powered by Cardano</p>
                </div>
              </>
            )}
          </div>
        </div>
        {isMenuOpen ? <SidebarContainer onClickNavItems={this.toggleMenu} /> : this.props.children}
      </div>
    );
  }
}
