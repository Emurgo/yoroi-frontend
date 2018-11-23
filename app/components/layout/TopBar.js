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
import type { Category } from '../../config/sidebarConfig';
import Wallet from '../../domain/Wallet';

type Props = {
  children?: ?Node,
  wallet: ?Wallet,
  currentRoute: string,
  formattedWalletAmount?: Function,
  categories: Array<Category>,
  activeSidebarCategory: string,
  onCategoryClicked?: Function,
};

@observer
export default class TopBar extends Component<Props> {
  static defaultProps = {
    children: undefined,
    formattedWalletAmount: undefined,
    onCategoryClicked: undefined
  };

  render() {
    const {
      wallet, currentRoute, formattedWalletAmount,
      categories, activeSidebarCategory, onCategoryClicked,
    } = this.props;

    // If we are looking at a wallet, show its name and balance
    const walletRoutesMatch = matchRoute(`${ROUTES.WALLETS.ROOT}/:id(*page)`, currentRoute);
    const showWalletInfo = walletRoutesMatch && wallet;
    const topBarTitle = showWalletInfo && formattedWalletAmount ? (
      <div className={styles.walletInfo}>
        <div className={styles.walletName}>{wallet && wallet.name}</div>
        <div className={styles.walletAmount}>
          { wallet && formattedWalletAmount(wallet.amount) + ' ADA' }
        </div>
      </div>
    ) : null;

    const topBarStyles = classNames([
      styles.topBar,
      showWalletInfo ? styles.withWallet : styles.withoutWallet,
    ]);

    return (
      <header className={topBarStyles}>
        <div className={styles.topBarTitle}>{topBarTitle}</div>
        {this.props.children}
        {categories.map(category => {
          const categoryClassName = kebabCase(category.name);
          return (
            <TopBarCategory
              key={category.name}
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
