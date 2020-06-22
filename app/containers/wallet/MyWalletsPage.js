// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import { computed } from 'mobx';
import { observer } from 'mobx-react';
import { intlShape, defineMessages } from 'react-intl';
import type { InjectedOrGenerated } from '../../types/injectedPropsType';

import MyWallets from '../../components/wallet/my-wallets/MyWallets';
import TopBarLayout from '../../components/layout/TopBarLayout';

import WalletsList from '../../components/wallet/my-wallets/WalletsList';
import WalletRow from '../../components/wallet/my-wallets/WalletRow';
import WalletDetails from '../../components/wallet/my-wallets/WalletDetails';
import WalletCurrency from '../../components/wallet/my-wallets/WalletCurrency';
import WalletSubRow from '../../components/wallet/my-wallets/WalletSubRow';
import NavPlate from '../../components/topbar/NavPlate';
import SidebarContainer from '../SidebarContainer';
import BannerContainer from '../banners/BannerContainer';
import type { GeneratedData as BannerContainerData } from '../banners/BannerContainer';
import type { GeneratedData as SidebarContainerData } from '../SidebarContainer';
import { ROUTES } from '../../routes-config';
import NavBar from '../../components/topbar/NavBar';
import NavBarTitle from '../../components/topbar/NavBarTitle';
import WalletSync from '../../components/wallet/my-wallets/WalletSync';
import BigNumber from 'bignumber.js';
import moment from 'moment';
import NavBarAddButton from '../../components/topbar/NavBarAddButton';
import NavWalletDetails from '../../components/topbar/NavWalletDetails';
import globalMessages from '../../i18n/global-messages';
import { ConceptualWallet, isLedgerNanoWallet, isTrezorTWallet } from '../../api/ada/lib/storage/models/ConceptualWallet/index';
import {
  asGetPublicKey,
} from '../../api/ada/lib/storage/models/PublicDeriver/traits';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { PublicDeriver } from '../../api/ada/lib/storage/models/PublicDeriver/index';
import type { ConceptualWalletSettingsCache } from '../../stores/toplevel/WalletSettingsStore';
import type { DelegationRequests } from '../../stores/ada/DelegationStore';
import type { PublicKeyCache } from '../../stores/toplevel/WalletStore';
import type { TxRequests } from '../../stores/toplevel/TransactionsStore';
import type { IGetPublic } from '../../api/ada/lib/storage/models/PublicDeriver/interfaces';
import { getApiForCoinType, getApiMeta } from '../../api/common/utils';

const messages = defineMessages({
  walletSumInfo: {
    id: 'myWallets.wallets.sumInfoText',
    defaultMessage: '!!!Total wallet balance',
  }
});

export type GeneratedData = typeof MyWalletsPage.prototype.generated;

type Props = InjectedOrGenerated<GeneratedData>

@observer
export default class MyWalletsPage extends Component<Props> {

  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };

  updateHideBalance: void => Promise<void> = async () => {
    await this.generated.actions.profile.updateHideBalance.trigger();
  }

  componentDidMount() {
    this.generated.actions.wallets.unselectWallet.trigger();
  }

  handleWalletNavItemClick: PublicDeriver<> => void = (
    publicDeriver
  ) => {
    this.generated.actions.router.goToRoute.trigger({
      route: ROUTES.WALLETS.TRANSACTIONS,
      params: { id: publicDeriver.getPublicDeriverId() },
    });
  };

  render(): Node {
    const { intl } = this.context;
    const { stores } = this.generated;
    const { profile } = stores;
    const sidebarContainer = (<SidebarContainer {...this.generated.SidebarContainerProps} />);

    const wallets = this.generated.stores.wallets.publicDerivers;

    let utxoTotal = new BigNumber(0);
    const walletBalances = wallets.map(wallet => {
      const balanceResult = stores.transactions
        .getTxRequests(wallet).requests.getBalanceRequest.result;
      const apiMeta = getApiMeta(getApiForCoinType(wallet.getParent().getCoinType()))?.meta;
      if (apiMeta == null) throw new Error(`${nameof(MyWalletsPage)} no API selected`);
      const amountPerUnit = new BigNumber(10).pow(apiMeta.decimalPlaces);
      return balanceResult?.dividedBy(amountPerUnit);
    });
    for (const walletUtxoAmount of walletBalances) {
      if (walletUtxoAmount == null) {
        utxoTotal = null;
        break;
      }
      utxoTotal = utxoTotal.plus(walletUtxoAmount);
    }


    const navbarTitle = (
      <NavBarTitle title={this.context.intl.formatMessage(globalMessages.sidebarWallets)} />
    );

    const navbarElement = (
      <NavBar
        title={navbarTitle}
        button={<NavBarAddButton onClick={
          () => this.generated.actions.router.goToRoute.trigger({ route: ROUTES.WALLETS.ADD })
        }
        />}
        walletDetails={
          <NavWalletDetails
            showDetails={false}
            highlightTitle
            onUpdateHideBalance={this.updateHideBalance}
            shouldHideBalance={profile.shouldHideBalance}
            rewards={new BigNumber('0.000000') /* TODO */}
            walletAmount={utxoTotal}
            infoText={intl.formatMessage(messages.walletSumInfo)}
            meta={{
              // TODO: this no longer makes sense in multi-wallet. Needs to be re-thought
              primaryTicker: 'ADA',
              decimalPlaces: 6,
            }}
          />
        }
      />
    );

    const walletsList = (
      <WalletsList>
        {wallets.map(wallet => this.generateRow(wallet))}
      </WalletsList>
    );

    return (
      <TopBarLayout
        banner={(<BannerContainer {...this.generated.BannerContainerProps} />)}
        sidebar={sidebarContainer}
        navbar={navbarElement}
        showInContainer
      >
        <MyWallets>
          {walletsList}
        </MyWallets>
      </TopBarLayout>
    );
  }

  /*
  * TODO: this should operator on conceptual wallets
  * with publicDerivers acting as sub-rows
  * but since we don't support multi-currency or multi-account yet we simplify the UI for now
  */
  generateRow: PublicDeriver<> => Node = (publicDeriver) => {
    const parent = publicDeriver.getParent();
    const settingsCache = this.generated.stores.walletSettings
      .getConceptualWalletSettingsCache(parent);

    const apiMeta = getApiMeta(getApiForCoinType(publicDeriver.getParent().getCoinType()))?.meta;
    if (apiMeta == null) throw new Error(`${nameof(MyWalletsPage)} no API selected`);
    const amountPerUnit = new BigNumber(10).pow(apiMeta.decimalPlaces);

    const walletSumCurrencies = (
      <>
        <WalletCurrency
          currency={apiMeta.primaryTicker}
          tooltipText={undefined /* TODO */}
        />
      </>
    );

    const txRequests = this.generated.stores.transactions
      .getTxRequests(publicDeriver);
    const balance = txRequests.requests.getBalanceRequest.result
      ?.dividedBy(amountPerUnit) || null;

    const withPubKey = asGetPublicKey(publicDeriver);
    const plate = withPubKey == null
      ? null
      : this.generated.stores.wallets.getPublicKeyCache(withPubKey).plate;

    return (
      <WalletRow
        isExpandable={false /* TODO: should be expandable if > 1 public deriver */}
        key={publicDeriver.getPublicDeriverId()}
        onRowClicked={() => this.handleWalletNavItemClick(publicDeriver)}
        walletSumDetails={<WalletDetails
          walletAmount={balance}
          rewards={this.getRewardBalance(publicDeriver)}
          // TODO: This should be probably bound to an individual wallet
          onUpdateHideBalance={this.updateHideBalance}
          shouldHideBalance={this.generated.stores.profile.shouldHideBalance}
          decimalPlaces={apiMeta.decimalPlaces.toNumber()}
        />}
        walletSumCurrencies={walletSumCurrencies}
        walletSubRow={() => this.createSubrow(publicDeriver)}
        walletPlate={
          <NavPlate
            plate={plate}
            walletName={settingsCache.conceptualWalletName}
            walletType={getWalletType(publicDeriver)}
          />
        }
        walletSync={
          <WalletSync
            time={
              txRequests.lastSyncInfo.Time
                ? moment(txRequests.lastSyncInfo.Time).fromNow()
                : null
            }
          />
        }
      />
    );
  }

  createSubrow: PublicDeriver<> => Node = (publicDeriver) => {
    const { intl } = this.context;

    const apiMeta = getApiMeta(getApiForCoinType(publicDeriver.getParent().getCoinType()))?.meta;
    if (apiMeta == null) throw new Error(`${nameof(MyWalletsPage)} no API selected`);

    // TODO: replace with wallet addresses
    const walletAddresses = [
      'Ae45dPwUPEZMen5UdmKCeiNqCooMVBpDQbmhM1dtFSFigvbvDTZdF4nbdf4u3',
      'Ae2tdPwUPEZMen5UdmKCeiNqCooMVBpDQbmhM1dtFSFigvbvDTZdF4nmt4s7'
    ];

    const addressesLength = walletAddresses.length;

    const parent = publicDeriver.getParent();
    const settingsCache = this.generated.stores.walletSettings
      .getConceptualWalletSettingsCache(parent);

    const withPubKey = asGetPublicKey(publicDeriver);
    const plate = withPubKey == null
      ? null
      : this.generated.stores.wallets.getPublicKeyCache(withPubKey).plate;

    const walletSubRow = (
      <WalletSubRow
        walletInfo={{
          conceptualWalletName: settingsCache.conceptualWalletName,
          plate,
        }}
        // TODO: do we delete WalletDetails? Lots of duplication with Nav alternative
        walletDetails={<WalletDetails
          infoText={
            `${addressesLength} ${
              intl.formatMessage(addressesLength > 1 ?
                globalMessages.addressesLabel : globalMessages.addressLabel)}`
          }
          // TODO: This should be probably bound to an individual wallet
          onUpdateHideBalance={this.updateHideBalance}
          shouldHideBalance={this.generated.stores.profile.shouldHideBalance}
          rewards={null /* TODO */}
          walletAmount={null /* TODO */}
          decimalPlaces={apiMeta.decimalPlaces.toNumber()}
        />}
        walletNumber={1}
        walletAddresses={walletAddresses /* TODO: replace with proper hashes */}
        walletCurrencies={<WalletCurrency
          currency={apiMeta.primaryTicker}
          tooltipText="0.060" // TODO
        />}
      />
    );

    return walletSubRow;
  }

  /**
   * undefined => wallet is not a reward wallet
   * null => still calculating
   * value => done calculating
   */
  getRewardBalance: PublicDeriver<> => null | void | BigNumber = (
    publicDeriver
  ) => {
    const delegationRequest = this.generated.stores.substores.ada.delegation.getDelegationRequests(
      publicDeriver
    );
    if (delegationRequest == null) return undefined;

    const balanceResult = delegationRequest.getDelegatedBalance.result;
    if (balanceResult == null) {
      return null;
    }
    const apiMeta = getApiMeta(getApiForCoinType(publicDeriver.getParent().getCoinType()))?.meta;
    if (apiMeta == null) throw new Error(`${nameof(MyWalletsPage)} no API selected`);
    const amountPerUnit = new BigNumber(10).pow(apiMeta.decimalPlaces);
    return balanceResult.accountPart.dividedBy(amountPerUnit);
  }

  @computed get generated(): {|
    BannerContainerProps: InjectedOrGenerated<BannerContainerData>,
    SidebarContainerProps: InjectedOrGenerated<SidebarContainerData>,
    actions: {|
      profile: {|
        updateHideBalance: {|
          trigger: (params: void) => Promise<void>
        |}
      |},
      router: {|
        goToRoute: {|
          trigger: (params: {|
            forceRefresh?: boolean,
            params?: ?any,
            route: string
          |}) => void
        |}
      |},
      wallets: {|
        unselectWallet: {| trigger: (params: void) => void |}
      |}
    |},
    stores: {|
      profile: {| shouldHideBalance: boolean |},
      substores: {|
        ada: {|
          delegation: {|
            getDelegationRequests: (
              PublicDeriver<>
            ) => void | DelegationRequests
          |}
        |}
      |},
      transactions: {|
        getTxRequests: (PublicDeriver<>) => TxRequests
      |},
      walletSettings: {|
        getConceptualWalletSettingsCache: ConceptualWallet => ConceptualWalletSettingsCache
      |},
      wallets: {|
        getPublicKeyCache: IGetPublic => PublicKeyCache,
        publicDerivers: Array<PublicDeriver<>>
      |}
    |}
    |} {
    if (this.props.generated !== undefined) {
      return this.props.generated;
    }
    if (this.props.stores == null || this.props.actions == null) {
      throw new Error(`${nameof(MyWalletsPage)} no way to generated props`);
    }
    const { stores, actions } = this.props;
    return Object.freeze({
      stores: {
        profile: {
          shouldHideBalance: stores.profile.shouldHideBalance,
        },
        wallets: {
          publicDerivers: stores.wallets.publicDerivers,
          getPublicKeyCache: stores.wallets.getPublicKeyCache,
        },
        transactions: {
          getTxRequests: stores.transactions.getTxRequests,
        },
        walletSettings: {
          getConceptualWalletSettingsCache:
            stores.walletSettings.getConceptualWalletSettingsCache,
        },
        substores: {
          ada: {
            delegation: {
              getDelegationRequests: stores.substores.ada.delegation.getDelegationRequests,
            },
          },
        },
      },
      actions: {
        profile: {
          updateHideBalance: { trigger: actions.profile.updateHideBalance.trigger },
        },
        router: {
          goToRoute: { trigger: actions.router.goToRoute.trigger },
        },
        wallets: {
          unselectWallet: { trigger: actions.wallets.unselectWallet.trigger },
        },
      },
      SidebarContainerProps: (
        { actions, stores }: InjectedOrGenerated<SidebarContainerData>
      ),
      BannerContainerProps: ({ actions, stores }: InjectedOrGenerated<BannerContainerData>),
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
