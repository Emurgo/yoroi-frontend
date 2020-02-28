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
import type { WalletWithCachedMeta } from '../stores/toplevel/WalletStore';
import { isLedgerNanoWallet, isTrezorTWallet } from '../api/ada/lib/storage/models/ConceptualWallet/index';
import ProfileActions from '../actions/profile-actions';
import RouterActions from '../actions/router-actions';
import { PublicDeriver } from '../api/ada/lib/storage/models/PublicDeriver';
import type { DelegationRequests } from '../stores/ada/DelegationStore';

const messages = defineMessages({
  allWalletsLabel: {
    id: 'wallet.nav.allWalletsLabel',
    defaultMessage: '!!!All wallets',
  },
});

export type GeneratedData = {|
  +stores: {|
    +wallets: {|
      +selected: null | WalletWithCachedMeta,
      +publicDerivers: Array<WalletWithCachedMeta>,
    |},
    +profile: {|
      +shouldHideBalance: boolean,
    |},
    +delegation: {|
      +getRequests: PublicDeriver<> => (void | DelegationRequests),
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
        wallets: {
          selected: stores.wallets.selected,
          publicDerivers: stores.wallets.publicDerivers,
        },
        profile: {
          shouldHideBalance: stores.profile.shouldHideBalance,
        },
        delegation: {
          getRequests: stores.substores.ada.delegation.getRequests,
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
    const publicDeriver = walletsStore.selected;
    if (publicDeriver == null) return null;

    const wallets = this.generated.stores.wallets.publicDerivers;

    let utxoTotal = new BigNumber(0);
    for (const walletUtxoAmount of wallets.map(wallet => wallet.amount)) {
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

    const dropdownHead = (
      <NavWalletDetails
        onUpdateHideBalance={this.updateHideBalance}
        shouldHideBalance={profile.shouldHideBalance}
        rewards={this.getRewardBalance(publicDeriver)}
        walletAmount={publicDeriver.amount}
      />
    );

    const walletComponents = wallets.map(wallet => (
      <NavDropdownRow
        key={wallet.self.getPublicDeriverId()}
        plateComponent={<NavPlate
          publicDeriver={wallet}
          walletName={wallet.conceptualWalletName}
          walletType={getWalletType(wallet)}
        />}
        isCurrentWallet={wallet === this.generated.stores.wallets.selected}
        syncTime={wallet.lastSyncInfo.Time
          ? moment(wallet.lastSyncInfo.Time).fromNow()
          : null
        }
        detailComponent={
          <NavWalletDetails
            walletAmount={wallet.amount}
            onUpdateHideBalance={this.updateHideBalance}
            shouldHideBalance={profile.shouldHideBalance}
            rewards={this.getRewardBalance(wallet)}
          />
        }
      />
    ));
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

    const dropdownComponent = (
      <NavDropdown
        headerComponent={dropdownHead}
        contentComponents={dropdownContent}
        onAddWallet={
          () => this.generated.actions.router.goToRoute.trigger({ route: ROUTES.WALLETS.ADD })
        }
      />
    );

    return (
      <NavBar
        title={this.props.title}
        walletPlate={
          <NavPlate
            publicDeriver={walletsStore.selected}
            walletName={publicDeriver.conceptualWalletName}
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
  getRewardBalance: WalletWithCachedMeta => null | void | BigNumber = (
    publicDeriver
  ) => {
    const delegationRequest = this.generated.stores.delegation.getRequests(
      publicDeriver.self
    );
    if (delegationRequest == null) return undefined;

    const balanceResult = delegationRequest.getDelegatedBalance.result;
    if (balanceResult == null) {
      return null;
    }
    return balanceResult.accountPart.dividedBy(LOVELACES_PER_ADA);
  }
}

function getWalletType(publicDeriver: WalletWithCachedMeta) {
  const conceptualWallet = publicDeriver.self.getParent();
  if (isLedgerNanoWallet(conceptualWallet)) {
    return 'ledger';
  }
  if (isTrezorTWallet(conceptualWallet)) {
    return 'trezor';
  }
  return 'standard';
}
