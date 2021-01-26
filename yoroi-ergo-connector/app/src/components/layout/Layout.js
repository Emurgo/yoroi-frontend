// @flow
import * as React from 'react';
import type { Node } from 'react';
import YoroiLogo from '../../assets/images/yoroi_logo.inline.svg';
import MenuIcon from '../../assets/images/menu-icon.inline.svg';
import styles from './Layout.scss';

type Props = {|
  children: Node,
|};

const Layout = ({ children }: Props): Node => {
  return (
    <div className={styles.layout}>
      <div className={styles.header}>
        <div className={styles.menuIcon}>
          <MenuIcon />
        </div>
        <div className={styles.menu}>
          <YoroiLogo />
          <div className={styles.logo}>
            <h3>Yoroi Dapp Connector</h3>
            <p className={styles.poweredBy}>Powered by Cardano</p>
          </div>
        </div>
      </div>
      {children}
    </div>
  );
};

export default Layout;
