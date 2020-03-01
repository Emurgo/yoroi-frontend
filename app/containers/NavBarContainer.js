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
import NavDropdown from '../components/topbar/NavDropdown';
import NavDropdownRow from '../components/topbar/NavDropdownRow';
import { ROUTES } from '../routes-config';
import { LOVELACES_PER_ADA } from '../config/numbersConfig';
import { isLedgerNanoWallet, isTrezorTWallet } from '../api/ada/lib/storage/models/ConceptualWallet/index';
import {
  asGetPublicKey,
} from '../api/ada/lib/storage/models/PublicDeriver/traits';
import ProfileActions from '../actions/profile-actions';
import RouterActions from '../actions/router-actions';
import { PublicDeriver } from '../api/ada/lib/storage/models/PublicDeriver';
import type { DelegationRequests } from '../stores/ada/DelegationStore';
import type { TxRequests } from '../stores/base/TransactionsStore';
import WalletSettingsStore from '../stores/base/WalletSettingsStore';
import WalletStore from '../stores/toplevel/WalletStore';

const messages = defineMessages({
  allWalletsLabel: {
    id: 'wallet.nav.allWalletsLabel',
    defaultMessage: '!!!All wallets',
  },
});

export type GeneratedData = {|
  +stores: {|
    +walletSettings: {|
      +getConceptualWalletSettingsCache:
        typeof WalletSettingsStore.prototype.getConceptualWalletSettingsCache,
    |},
    +wallets: {|
      +selected: null | PublicDeriver<>,
      +publicDerivers: Array<PublicDeriver<>>,
      +getPublicKeyCache: typeof WalletStore.prototype.getPublicKeyCache,
    |},
    +profile: {|
      +shouldHideBalance: boolean,
    |},
    +delegation: {|
      +getRequests: PublicDeriver<> => (void | DelegationRequests),
    |},
    +transactions: {|
      +getTxRequests: PublicDeriver<> => TxRequests,
    |},
  |},
  +actions: {|
    +profile: {|
      +updateHideBalance: {|
        +trigger: typeof ProfileActions.prototype.updateHideBalance.trigger
      |},
    |},
    +router: {|
      +goToRoute: {|
        +trigger: typeof RouterActions.prototype.goToRoute.trigger
      |},
    |},
  |},
|};

type Props = {|
  ...InjectedOrGenerated<GeneratedData>,
  title: Node,
|};

@observer
export default class NavBarContainer extends Component<Props> {

  static contextTypes = {
    intl: intlShape.isRequired,
  };

  @computed get generated(): GeneratedData {
    if (this.props.generated !== undefined) {
      return this.props.generated;
    }
    if (this.props.stores == null || this.props.actions == null) {
      throw new Error(`${nameof(NavBarContainer)} no way to generated props`);
    }
    const { stores, actions } = this.props;
    return Object.freeze({
      stores: {
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
          getRequests: stores.substores.ada.delegation.getRequests,
        },
        transactions: {
          getTxRequests: stores.substores.ada.transactions.getTxRequests,
        },
      },
      actions: {
        profile: {
          updateHideBalance: { trigger: actions.profile.updateHideBalance.trigger },
        },
        router: {
          goToRoute: { trigger: actions.router.goToRoute.trigger },
        },
      },
    });
  }

  updateHideBalance = () => {
    this.generated.actions.profile.updateHideBalance.trigger();
  }

  render() {
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

    const publicDeriver = walletsStore.selected;
    if (publicDeriver == null) return null;
    const txRequests = this.generated.stores.transactions.getTxRequests(publicDeriver);
    const parent = publicDeriver.getParent();
    const settingsCache = this.generated.stores.walletSettings
      .getConceptualWalletSettingsCache(parent);

    const withPubKey = asGetPublicKey(publicDeriver);
    const plate = withPubKey == null
      ? null
      : this.generated.stores.wallets.getPublicKeyCache(withPubKey).plate;

    const dropdownComponent = (() => {
      const balance = txRequests.requests.getBalanceRequest.result
        ?.dividedBy(LOVELACES_PER_ADA) || null;
      const dropdownHead = (
        <NavWalletDetails
          onUpdateHideBalance={this.updateHideBalance}
          shouldHideBalance={profile.shouldHideBalance}
          rewards={this.getRewardBalance(publicDeriver)}
          walletAmount={balance}
        />
      );
      return (
        <NavDropdown
          headerComponent={dropdownHead}
          contentComponents={dropdownContent}
          onAddWallet={
            () => this.generated.actions.router.goToRoute.trigger({ route: ROUTES.WALLETS.ADD })
          }
        />
      );
    })();

    return (
      <NavBar
        title={this.props.title}
        walletPlate={
          <NavPlate
            plate={plate}
            walletName={settingsCache.conceptualWalletName}
            walletType={getWalletType(publicDeriver)}
          />
        }
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
    const delegationRequest = this.generated.stores.delegation.getRequests(
      publicDeriver
    );
    if (delegationRequest == null) return undefined;

    const balanceResult = delegationRequest.getDelegatedBalance.result;
    if (balanceResult == null) {
      return null;
    }
    return balanceResult.accountPart.dividedBy(LOVELACES_PER_ADA);
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
