// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import { kebabCase } from 'lodash';
import classNames from 'classnames';
import { observer } from 'mobx-react';
import TopBarCategory from './TopBarCategory';
import styles from './TopBar.scss';
import { matchRoute } from '../../utils/routing';
import { ROUTES } from '../../routes-config';
import WalletsStore from '../../stores/WalletStore';

type Props = {
  children?: ?Node,
  wallets?: ?WalletsStore,
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
      wallets, currentRoute, formattedWalletAmount,
      categories, activeSidebarCategory, onCategoryClicked,
    } = this.props;
    const walletRoutesMatch = matchRoute(`${ROUTES.WALLETS.ROOT}/:id(*page)`, currentRoute);
    const showWalletInfo = walletRoutesMatch && wallets.active != null;
    const topBarStyles = classNames([
      styles.topBar,
      showWalletInfo ? styles.withWallet : styles.withoutWallet,
    ]);

    const topBarTitle = showWalletInfo && formattedWalletAmount ? (
      <div className={styles.walletInfo}>
        <div className={styles.walletName}>{wallets.active.name}</div>
        <div className={styles.walletAmount}>
          { formattedWalletAmount(wallets.active.balance, true, true) + ' ADA' }
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
              onClick={() => {
                if (onCategoryClicked) {
                  onCategoryClicked(category.route);
                }
              }}
            />
          );
        })}
      </header>
    );
  }
}
