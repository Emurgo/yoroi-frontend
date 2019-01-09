// @flow
import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import type { InjectedProps } from '../../types/injectedPropsType';
import AdaRedemptionChoices from '../../components/wallet/ada-redemption/AdaRedemptionChoices';
import type { RedemptionTypeChoices } from '../../types/redemptionTypes';
import AdaRedemptionNoWallets from '../../components/wallet/ada-redemption/AdaRedemptionNoWallets';
import { ROUTES } from '../../routes-config';

// FIXME: the inject will have to be changed
@inject('stores', 'actions') @observer
export default class AdaRedemptionPage extends Component<InjectedProps> {
  static defaultProps = { actions: null, stores: null };

  handleGoToCreateWalletClick = () => {
    this.props.actions.router.goToRoute.trigger({ route: ROUTES.WALLETS.ADD });
  };

  render() {
    const { wallets } = this.props.stores.ada;

    const selectableWallets = wallets.all.map((w) => ({
      value: w.id, label: w.name
    }));

    if (!wallets.all.length) {
      return (
        <div>
          <AdaRedemptionNoWallets
            onGoToCreateWalletClick={this.handleGoToCreateWalletClick}
          />
        </div>
      );
    }

    return (
      <div>
        Ada Redeem page
      </div>
    );
  }
}
