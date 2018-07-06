// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import { kebabCase } from 'lodash';
import classNames from 'classnames';
import { observer } from 'mobx-react';
import TopBarCategory from './TopBarCategory';
import Wallet from '../../domain/Wallet';
import styles from './TopBar.scss';
import { matchRoute } from '../../utils/routing';
import { ROUTES } from '../../routes-config';

type Props = {
  children?: ?Node,
  activeWallet?: ?Wallet,
  currentRoute: string,
  showSubMenus?: ?boolean,
  formattedWalletAmount?: Function,
  categories: Array<{
    name: string,
    route: string,
    icon: string,
  }>,
  activeSidebarCategory: string,
  onCategoryClicked?: Function,
};

@observer
export default class TopBar extends Component<Props> {

  render() {
    const {
      activeWallet, currentRoute, formattedWalletAmount,
      categories, activeSidebarCategory, onCategoryClicked,
    } = this.props;
    const walletRoutesMatch = matchRoute(`${ROUTES.WALLETS.ROOT}/:id(*page)`, currentRoute);
    const showWalletInfo = walletRoutesMatch && activeWallet != null;
    const topBarStyles = classNames([
      styles.topBar,
      showWalletInfo ? styles.withWallet : styles.withoutWallet,
    ]);

    const topBarTitle = walletRoutesMatch && activeWallet != null && formattedWalletAmount ? (
      <div className={styles.walletInfo}>
        <div className={styles.walletName}>{activeWallet.name}</div>
        <div className={styles.walletAmount}>
          {
            // show currency and use long format (e.g. in ETC show all decimal places)
            formattedWalletAmount(activeWallet.amount, true, true)
          } ADA
        </div>
      </div>
    ) : null;

    return (
      <header className={topBarStyles}>
        <div className={styles.topBarTitle}>{topBarTitle}</div>
        {this.props.children}
        {categories.map((category, index) => {
          const categoryClassName = kebabCase(category.name);
          return (
            <TopBarCategory
              key={index}
              className={categoryClassName}
              icon={category.icon}
              active={activeSidebarCategory === category.route}
              onClick={() => onCategoryClicked(category.route)}
            />
          );
        })}
      </header>
    );
  }
}
