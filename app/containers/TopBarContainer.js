// @flow
import type { Node } from 'react';
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { computed } from 'mobx';
import TopBar from '../components/topbar/TopBar';
import WalletTopbarTitle from '../components/topbar/WalletTopbarTitle';
import type { InjectedOrGenerated } from '../types/injectedPropsType';
import { LOVELACES_PER_ADA } from '../config/numbersConfig';
import {
  asGetPublicKey,
} from '../api/ada/lib/storage/models/PublicDeriver/traits';

import { formattedWalletAmount } from '../utils/formatters';

export type GeneratedData = typeof TopBarContainer.prototype.generated;

type Props = InjectedOrGenerated<GeneratedData>;

@observer
export default class TopBarContainer extends Component<Props> {

  updateHideBalance: void => Promise<void> = async () => {
    await this.generated.actions.profile.updateHideBalance.trigger();
  }

  render(): Node {
    const { actions, stores } = this.generated;
    const { app, topbar, profile, coinPriceStore } = stores;

    const coinPrice = profile.unitOfAccount.enabled ?
      coinPriceStore.getCurrentPrice('ADA', profile.unitOfAccount.currency) : null;

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
        : this.generated.stores.wallets.getPublicKeyCache(withPubKey).plate;

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
      coinPrice={coinPrice}
      unitOfAccountSetting={profile.unitOfAccount}
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

  @computed get generated() {
    if (this.props.generated !== undefined) {
      return this.props.generated;
    }
    if (this.props.stores == null || this.props.actions == null) {
      throw new Error(`${nameof(TopBarContainer)} no way to generated props`);
    }
    const { stores, actions } = this.props;
    const { coinPriceStore } = stores.substores.ada;
    return Object.freeze({
      stores: {
        coinPriceStore: {
          getCurrentPrice: coinPriceStore.getCurrentPrice,
        },
        profile: {
          isClassicTheme: stores.profile.isClassicTheme,
          shouldHideBalance: stores.profile.shouldHideBalance,
          unitOfAccount: stores.profile.unitOfAccount,
        },
        wallets: {
          getPublicKeyCache: stores.wallets.getPublicKeyCache,
          selected: stores.wallets.selected,
        },
        topbar: {
          isActiveCategory: stores.topbar.isActiveCategory,
          categories: stores.topbar.categories,
        },
        app: {
          currentRoute: stores.app.currentRoute,
        },
        substores: {
          ada: {
            transactions: {
              getTxRequests: stores.substores.ada.transactions.getTxRequests,
            },
          },
        },
      },
      actions: {
        profile: {
          updateHideBalance: { trigger: actions.profile.updateHideBalance.trigger },
        },
        topbar: {
          activateTopbarCategory: { trigger: actions.topbar.activateTopbarCategory.trigger },
        },
      },
    });
  }
}
