// @flow
import moment from 'moment';
import { computed } from 'mobx';
import React, { Component } from 'react';
import type { Node } from 'react';
import BigNumber from 'bignumber.js';
import { observer } from 'mobx-react';
import type { InjectedOrGenerated } from '../types/injectedPropsType';
import { intlShape, defineMessages } from 'react-intl';
import NavBar from '../components/topbar/NavBar';
import NavPlate from '../components/topbar/NavPlate';
import NavWalletDetails from '../components/topbar/NavWalletDetails';
import NoWalletsDropdown from '../components/topbar/NoWalletsDropdown';
import NavDropdown from '../components/topbar/NavDropdown';
import NavDropdownRow from '../components/topbar/NavDropdownRow';
import { ROUTES } from '../routes-config';
import { switchRouteWallet } from '../utils/routing';
import { LOVELACES_PER_ADA } from '../config/numbersConfig';
import { isLedgerNanoWallet, isTrezorTWallet } from '../api/ada/lib/storage/models/ConceptualWallet/index';
import {
  asGetPublicKey,
} from '../api/ada/lib/storage/models/PublicDeriver/traits';
import { PublicDeriver } from '../api/ada/lib/storage/models/PublicDeriver';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';

const messages = defineMessages({
  allWalletsLabel: {
    id: 'wallet.nav.allWalletsLabel',
    defaultMessage: '!!!All wallets',
  },
});

export type GeneratedData = typeof NavBarContainer.prototype.generated;

type Props = {|
  ...InjectedOrGenerated<GeneratedData>,
  title: Node,
|};

@observer
export default class NavBarContainer extends Component<Props> {

  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };

  updateHideBalance: void => Promise<void> = async () => {
    await this.generated.actions.profile.updateHideBalance.trigger();
  }

  switchToNewWallet: PublicDeriver<> => void = (newWallet) => {
    const newRoute = switchRouteWallet(
      this.generated.stores.app.currentRoute,
      newWallet.getPublicDeriverId()
    );
    if (newRoute === this.generated.stores.app.currentRoute) {
      // the route specified in the URL would usually switch the selected wallet for us
      // but if the route is the same even after switching wallets, this won't trigger
      // so we manually switch the wallets in this case
      this.generated.actions.wallets.setActiveWallet.trigger({
        wallet: newWallet,
      });
    }
    this.generated.actions.router.goToRoute.trigger({
      route: newRoute,
      /**
       * need to force a refresh
       * since some onMount and willMount hooks depend on the selected wallet
      */
      forceRefresh: true,
    });
  }

  render(): Node {
    const { intl } = this.context;
    const { stores } = this.generated;
    const { profile } = stores;

    const walletsStore = stores.wallets;

    const wallets = this.generated.stores.wallets.publicDerivers;

    let utxoTotal = new BigNumber(0);
    const walletBalances = wallets.map(wallet => stores.transactions
      .getTxRequests(wallet).requests.getBalanceRequest.result
      ?.dividedBy(
        LOVELACES_PER_ADA
      ));
    for (const walletUtxoAmount of walletBalances) {
      if (walletUtxoAmount == null) {
        utxoTotal = null;
        break;
      }
      utxoTotal = utxoTotal.plus(walletUtxoAmount);
    }

    let rewardTotal = new BigNumber(0);
    for (const wallet of wallets) {
      const amount = this.getRewardBalance(wallet);
      if (amount === undefined) continue;
      if (amount === null) {
        rewardTotal = null;
        break;
      }
      rewardTotal = rewardTotal?.plus(amount);
    }

    const walletComponents = wallets.map(wallet => {
      const txRequests = this.generated.stores.transactions.getTxRequests(wallet);
      const balance = txRequests.requests.getBalanceRequest.result
        ?.dividedBy(LOVELACES_PER_ADA) || null;

      const parent = wallet.getParent();
      const settingsCache = this.generated.stores.walletSettings
        .getConceptualWalletSettingsCache(parent);

      const withPubKey = asGetPublicKey(wallet);
      const plate = withPubKey == null
        ? null
        : this.generated.stores.wallets.getPublicKeyCache(withPubKey).plate;

      return (
        <NavDropdownRow
          key={wallet.getPublicDeriverId()}
          plateComponent={<NavPlate
            plate={plate}
            walletName={settingsCache.conceptualWalletName}
            walletType={getWalletType(wallet)}
          />}
          onSelect={() => this.switchToNewWallet(wallet)}
          isCurrentWallet={wallet === this.generated.stores.wallets.selected}
          syncTime={txRequests.lastSyncInfo.Time
            ? moment(txRequests.lastSyncInfo.Time).fromNow()
            : null
          }
          detailComponent={
            <NavWalletDetails
              walletAmount={balance}
              onUpdateHideBalance={this.updateHideBalance}
              shouldHideBalance={profile.shouldHideBalance}
              rewards={this.getRewardBalance(wallet)}
            />
          }
        />
      );
    });
    const dropdownContent = (
      <>
        <NavDropdownRow
          title={intl.formatMessage(messages.allWalletsLabel)}
          detailComponent={
            <NavWalletDetails
              highlightTitle
              onUpdateHideBalance={this.updateHideBalance}
              shouldHideBalance={profile.shouldHideBalance}
              rewards={rewardTotal}
              walletAmount={utxoTotal}
            />
          }
        />
        {walletComponents}
      </>
    );

    const dropdownComponent = (() => {
      const getDropdownHead = (() => {
        const publicDeriver = walletsStore.selected;
        if (publicDeriver == null) {
          return (
            <NoWalletsDropdown />
          );
        }

        const txRequests = this.generated.stores.transactions.getTxRequests(publicDeriver);
        const balance = txRequests.requests.getBalanceRequest.result
          ?.dividedBy(LOVELACES_PER_ADA) || null;

        return (
          <NavWalletDetails
            onUpdateHideBalance={this.updateHideBalance}
            shouldHideBalance={profile.shouldHideBalance}
            rewards={this.getRewardBalance(publicDeriver)}
            walletAmount={balance}
          />
        );
      });

      return (
        <NavDropdown
          headerComponent={getDropdownHead()}
          contentComponents={dropdownContent}
          onAddWallet={
            () => this.generated.actions.router.goToRoute.trigger({ route: ROUTES.WALLETS.ADD })
          }
        />
      );
    })();

    const getPlate = (() => {
      const publicDeriver = walletsStore.selected;
      if (publicDeriver == null) return null;

      const parent = publicDeriver.getParent();

      const settingsCache = this.generated.stores.walletSettings
        .getConceptualWalletSettingsCache(parent);

      const withPubKey = asGetPublicKey(publicDeriver);
      const plate = withPubKey == null
        ? null
        : this.generated.stores.wallets.getPublicKeyCache(withPubKey).plate;

      return (
        <NavPlate
          plate={plate}
          walletName={settingsCache.conceptualWalletName}
          walletType={getWalletType(publicDeriver)}
        />
      );
    });

    return (
      <NavBar
        title={this.props.title}
        walletPlate={getPlate()}
        walletDetails={dropdownComponent}
      />
    );
  }

  /**
   * undefined => wallet is not a reward wallet
   * null => still calculating
   * value => done calculating
   */
  getRewardBalance: PublicDeriver<> => null | void | BigNumber = (
    publicDeriver
  ) => {
    const delegationRequest = this.generated.stores.delegation.getDelegationRequests(
      publicDeriver
    );
    if (delegationRequest == null) return undefined;

    const balanceResult = delegationRequest.getDelegatedBalance.result;
    if (balanceResult == null) {
      return null;
    }
    return balanceResult.accountPart.dividedBy(LOVELACES_PER_ADA);
  }

  @computed get generated() {
    if (this.props.generated !== undefined) {
      return this.props.generated;
    }
    if (this.props.stores == null || this.props.actions == null) {
      throw new Error(`${nameof(NavBarContainer)} no way to generated props`);
    }
    const { stores, actions } = this.props;
    return Object.freeze({
      stores: {
        app: {
          currentRoute: stores.app.currentRoute,
        },
        walletSettings: {
          getConceptualWalletSettingsCache: stores.substores.ada.walletSettings
            .getConceptualWalletSettingsCache,
        },
        wallets: {
          selected: stores.wallets.selected,
          publicDerivers: stores.wallets.publicDerivers,
          getPublicKeyCache: stores.wallets.getPublicKeyCache,
        },
        profile: {
          shouldHideBalance: stores.profile.shouldHideBalance,
        },
        delegation: {
          getDelegationRequests: stores.substores.ada.delegation.getDelegationRequests,
        },
        transactions: {
          getTxRequests: stores.substores.ada.transactions.getTxRequests,
        },
      },
      actions: {
        wallets: {
          setActiveWallet: { trigger: actions.wallets.setActiveWallet.trigger },
        },
        profile: {
          updateHideBalance: { trigger: actions.profile.updateHideBalance.trigger },
        },
        router: {
          goToRoute: { trigger: actions.router.goToRoute.trigger },
        },
      },
    });
  }
}

function getWalletType(publicDeriver: PublicDeriver<>) {
  const conceptualWallet = publicDeriver.getParent();
  if (isLedgerNanoWallet(conceptualWallet)) {
    return 'ledger';
  }
  if (isTrezorTWallet(conceptualWallet)) {
    return 'trezor';
  }
  return 'standard';
}
