// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import TopBar from '../components/topbar/TopBar';
import WalletTopbarTitle from '../components/topbar/WalletTopbarTitle';
import type { InjectedProps } from '../types/injectedPropsType';
import { LOVELACES_PER_ADA } from '../config/numbersConfig';
import {
  asGetPublicKey,
} from '../api/ada/lib/storage/models/PublicDeriver/traits';

import { formattedWalletAmount } from '../utils/formatters';

type Props = InjectedProps;

@observer
export default class TopBarContainer extends Component<Props> {

  updateHideBalance = async (): Promise<void> => {
    await this.props.actions.profile.updateHideBalance.trigger();
  }

  render() {
    const { actions, stores } = this.props;
    const { app, topbar, profile } = stores;

    const walletsStore = stores.wallets;
    const walletInfo = (() => {
      if (walletsStore.selected == null) {
        return null;
      }
      const selected = walletsStore.selected;
      const amount = stores.substores.ada.transactions
        .getTxRequests(selected).requests.getBalanceRequest.result
        ?.dividedBy(LOVELACES_PER_ADA);

      const withPubKey = asGetPublicKey(selected);
      const plate = withPubKey == null
        ? null
        : this.props.stores.wallets.getPublicKeyCache(withPubKey).plate;

      return {
        type: selected.getParent().getWalletType(),
        plate,
        amount,
        conceptualWalletName: self.conceptualWalletName,
      };
    })();
    const title = (<WalletTopbarTitle
      walletInfo={walletInfo}
      publicDeriver={walletsStore.selected}
      currentRoute={app.currentRoute}
      formattedWalletAmount={formattedWalletAmount}
      themeProperties={{
        identiconSaturationFactor: profile.isClassicTheme ? -5 : 0
      }}
      onUpdateHideBalance={this.updateHideBalance}
      shouldHideBalance={profile.shouldHideBalance}
    />);
    return (
      <TopBar
        title={title}
        onCategoryClicked={category => {
          actions.topbar.activateTopbarCategory.trigger({ category });
        }}
        isActiveCategory={topbar.isActiveCategory}
        categories={topbar.categories}
      />
    );
  }
}
