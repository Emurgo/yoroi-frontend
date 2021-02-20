// @flow
import type { Node } from 'react'
import React, { Component } from 'react'
import { computed } from 'mobx'
import { observer } from 'mobx-react'
import type { $npm$ReactIntl$IntlFormat } from 'react-intl'
import { intlShape, } from 'react-intl'
import type { InjectedOrGenerated } from '../../types/injectedPropsType'

import MyWallets from '../../components/wallet/my-wallets/MyWallets'
import TopBarLayout from '../../components/layout/TopBarLayout'

import WalletsList from '../../components/wallet/my-wallets/WalletsList'
import WalletRow from '../../components/wallet/my-wallets/WalletRow'
import WalletDetails from '../../components/wallet/my-wallets/WalletDetails'
import WalletCurrency from '../../components/wallet/my-wallets/WalletCurrency'
import WalletSubRow from '../../components/wallet/my-wallets/WalletSubRow'
import NavPlate from '../../components/topbar/NavPlate'
import type { GeneratedData as SidebarContainerData } from '../SidebarContainer'
import SidebarContainer from '../SidebarContainer'
import type { GeneratedData as BannerContainerData } from '../banners/BannerContainer'
import BannerContainer from '../banners/BannerContainer'
import { ROUTES } from '../../routes-config'
import NavBar from '../../components/topbar/NavBar'
import NavBarTitle from '../../components/topbar/NavBarTitle'
import WalletSync from '../../components/wallet/my-wallets/WalletSync'
import moment from 'moment'
import NavBarAddButton from '../../components/topbar/NavBarAddButton'
import BuySellAdaButton from '../../components/topbar/BuySellAdaButton'
import globalMessages from '../../i18n/global-messages'
import { ConceptualWallet, } from '../../api/ada/lib/storage/models/ConceptualWallet/index'
import { asGetPublicKey, } from '../../api/ada/lib/storage/models/PublicDeriver/traits'
import { PublicDeriver } from '../../api/ada/lib/storage/models/PublicDeriver/index'
import type { ConceptualWalletSettingsCache } from '../../stores/toplevel/WalletSettingsStore'
import type { DelegationRequests } from '../../stores/toplevel/DelegationStore'
import type { PublicKeyCache } from '../../stores/toplevel/WalletStore'
import type { TxRequests } from '../../stores/toplevel/TransactionsStore'
import type { IGetPublic } from '../../api/ada/lib/storage/models/PublicDeriver/interfaces'
import type { TokenRow } from '../../api/ada/lib/storage/database/primitives/tables'
import { MultiToken } from '../../api/common/lib/MultiToken'
import type { TokenInfoMap } from '../../stores/toplevel/TokenInfoStore'
import { genLookupOrFail, getTokenName } from '../../stores/stateless/tokenHelpers'
import BuySellDialog from '../../components/buySell/BuySellDialog'
import type { AddressSubgroupMeta, IAddressTypeStore, IAddressTypeUiSubset } from '../../stores/stateless/addressStores'
import { allAddressSubgroups } from '../../stores/stateless/addressStores'
import type { AddressFilterKind } from '../../types/AddressFilterTypes'
import LocalizableError from '../../i18n/LocalizableError'
import { addressToDisplayString } from '../../api/ada/lib/storage/bridge/utils'

export type GeneratedData = typeof MyWalletsPage.prototype.generated;

type Props = InjectedOrGenerated<GeneratedData>

@observer
export default class MyWalletsPage extends Component<Props> {

  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  onClose: void => void = () => {
    this.generated.actions.dialogs.closeActiveDialog.trigger();
  };

  openDialogWrapper: any => void = (dialog) => {
    this.generated.actions.dialogs.open.trigger({ dialog });
  }

  updateHideBalance: void => Promise<void> = async () => {
    await this.generated.actions.profile.updateHideBalance.trigger();
  }

  componentDidMount () {
    this.generated.actions.wallets.unselectWallet.trigger();
  }

  handleWalletNavItemClick: PublicDeriver<> => void = (
    publicDeriver
  ) => {
    this.generated.actions.router.goToRoute.trigger({
      route: ROUTES.WALLETS.ROOT,
      publicDeriver
    });
  };

  openToSettings: PublicDeriver<> => void = (
    publicDeriver
  ) => {
    this.generated.actions.wallets.setActiveWallet.trigger({
      wallet: publicDeriver
    });
    this.generated.actions.router.goToRoute.trigger({
      route: ROUTES.SETTINGS.WALLET,
    });
  };

  render (): Node {
    const { intl } = this.context;
    const { stores } = this.generated;
    const { uiDialogs } = stores;

    const sidebarContainer = (<SidebarContainer {...this.generated.SidebarContainerProps} />);

    const wallets = this.generated.stores.wallets.publicDerivers;

    const navbarTitle = (
      <NavBarTitle title={intl.formatMessage(globalMessages.sidebarWallets)} />
    );

    const navbarElement = (
      <NavBar
        title={navbarTitle}
        button={<NavBarAddButton onClick={
          () => this.generated.actions.router.goToRoute.trigger({ route: ROUTES.WALLETS.ADD })
        }
        />}
        buyButton={
          <BuySellAdaButton onBuySellClick={() =>
            (this.openDialogWrapper(BuySellDialog))
          }
          />
        }
        walletDetails={undefined}
      />
    );

    const walletsList = (
      <WalletsList>
        {wallets.map(wallet => this.generateRow(wallet))}
      </WalletsList>
    );

    let activeDialog = null;
    if (uiDialogs.isOpen(BuySellDialog)) {
      activeDialog = <BuySellDialog
        onCancel={this.onClose}
        walletList={async () => {
          return await this.generateUnusedAddressesPerWallet(wallets);
        }}
      />
    }

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
        {activeDialog}
      </TopBarLayout>
    );
  }

  generateUnusedAddressesPerWallet: PublicDeriver<> => Promise<Array<string, string>> =
    async (wallets: array<publicDeriver>) => {
      const infoWallets = wallets.map(async (wallet: publicDeriver) => {
        // Wallet Name
        const parent: ConceptualWallet = wallet.getParent();
        const settingsCache: ConceptualWalletSettingsCache = this.generated.stores.walletSettings
          .getConceptualWalletSettingsCache(parent);

        // An Address
        const allAddresses = await wallet.getAllUtxoAddresses();
        const anAddressFormatted = addressToDisplayString(
          allAddresses[0].addrs[0].Hash,
          parent.getNetworkInfo()
        )

        // Currency Name
        const defaultToken = this.generated.stores.tokenInfoStore.getDefaultTokenInfo(
          wallet.getParent().getNetworkInfo().NetworkId
        )
        const currencyName = getTokenName(defaultToken)

        return {
          walletName: settingsCache.conceptualWalletName,
          currencyName,
          anAddressFormatted,
        }
      })
      return await Promise.all(infoWallets)
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

    const walletSumCurrencies = (() => {
      const network = publicDeriver.getParent().getNetworkInfo();
      const defaultToken = this.generated.stores.tokenInfoStore.getDefaultTokenInfo(
        network.NetworkId
      );
      const defaultTokenInfo = genLookupOrFail(this.generated.stores.tokenInfoStore.tokenInfo)(
        {
          identifier: defaultToken.Identifier,
          networkId: network.NetworkId,
        }
      );
      return (
        <>
          <WalletCurrency
            currency={getTokenName(defaultTokenInfo)}
            tooltipText={undefined /* TODO */}
          />
        </>
      );
    })();

    const txRequests: TxRequests = this.generated.stores.transactions
      .getTxRequests(publicDeriver);
    const balance = txRequests.requests.getBalanceRequest.result ?? null;

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
          getTokenInfo={genLookupOrFail(this.generated.stores.tokenInfoStore.tokenInfo)}
        />}
        walletSumCurrencies={walletSumCurrencies}
        walletSubRow={() => this.createSubrow(publicDeriver)}
        walletPlate={
          <NavPlate
            plate={plate}
            wallet={settingsCache}
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
        onSettings={() => this.openToSettings(publicDeriver)}
      />
    );
  }

  createSubrow: PublicDeriver<> => Node = (publicDeriver) => {
    const { intl } = this.context;

    const network = publicDeriver.getParent().getNetworkInfo();
    const defaultToken = this.generated.stores.tokenInfoStore.getDefaultTokenInfo(
      network.NetworkId
    );
    const defaultTokenInfo = genLookupOrFail(this.generated.stores.tokenInfoStore.tokenInfo)(
      {
        identifier: defaultToken.Identifier,
        networkId: network.NetworkId,
      }
    );

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
          getTokenInfo={genLookupOrFail(this.generated.stores.tokenInfoStore.tokenInfo)}
        />}
        walletNumber={1}
        walletAddresses={walletAddresses /* TODO: replace with proper hashes */}
        walletCurrencies={<WalletCurrency
          currency={getTokenName(defaultTokenInfo)}
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
  getRewardBalance: PublicDeriver<> => null | void | MultiToken = (
    publicDeriver
  ) => {
    const delegationRequest = this.generated.stores
      .delegation
      .getDelegationRequests(
        publicDeriver
      );
    if (delegationRequest == null) return undefined;

    const balanceResult = delegationRequest.getDelegatedBalance.result;
    if (balanceResult == null) {
      return null;
    }
    return balanceResult.accountPart;
  }

  @computed get generated (): {|
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
            publicDeriver?: null | PublicDeriver<>,
            params?: ?any,
            route: string
          |}) => void
        |}
      |},
      dialogs: {|
        closeActiveDialog: {|
          trigger: (params: void) => void
        |},
        open: {|
          trigger: (params: {|
            dialog: any,
            params?: any
          |}) => void
        |},
      |},
      wallets: {|
        unselectWallet: {| trigger: (params: void) => void |},
        setActiveWallet: {| trigger: (params: {| wallet: PublicDeriver<> |}) => void |},
      |},
      addresses: {|
        createAddress: {|
          trigger: (params: PublicDeriver<>) => Promise<void>
        |},
      |},
    |},
    stores: {|
      profile: {| shouldHideBalance: boolean |},
      uiDialogs: {|
        hasOpen: boolean,
        getParam: <T>(number | string) => (void | T),
        isOpen: any => boolean
      |},
      addresses: {|
        addressFilter: AddressFilterKind,
        createAddressRequest: {| isExecuting: boolean |},
        error: ?LocalizableError,
        addressSubgroupMap: $ReadOnlyMap<Class<IAddressTypeStore>, IAddressTypeUiSubset>,
      |},
      delegation: {|
        getDelegationRequests: (
          PublicDeriver<>
        ) => void | DelegationRequests
      |},
      tokenInfoStore: {|
        tokenInfo: TokenInfoMap,
        getDefaultTokenInfo: number => $ReadOnly<TokenRow>,
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
        uiDialogs: {
          hasOpen: stores.uiDialogs.hasOpen,
          isOpen: stores.uiDialogs.isOpen,
          getParam: stores.uiDialogs.getParam,
        },
        wallets: {
          publicDerivers: stores.wallets.publicDerivers,
          getPublicKeyCache: stores.wallets.getPublicKeyCache,
        },
        tokenInfoStore: {
          tokenInfo: stores.tokenInfoStore.tokenInfo,
          getDefaultTokenInfo: stores.tokenInfoStore.getDefaultTokenInfo,
        },
        transactions: {
          getTxRequests: stores.transactions.getTxRequests,
        },
        walletSettings: {
          getConceptualWalletSettingsCache:
            stores.walletSettings.getConceptualWalletSettingsCache,
        },
        addresses: {
          addressFilter: stores.addresses.addressFilter,
          addressSubgroupMap: stores.addresses.addressSubgroupMap,
          createAddressRequest: {
            isExecuting: stores.addresses.createAddressRequest.isExecuting,
          },
          error: stores.addresses.error,
        },
        delegation: {
          getDelegationRequests: stores.delegation.getDelegationRequests,
        },
      },
      actions: {
        profile: {
          updateHideBalance: { trigger: actions.profile.updateHideBalance.trigger },
        },
        router: {
          goToRoute: { trigger: actions.router.goToRoute.trigger },
        },
        dialogs: {
          closeActiveDialog: {
            trigger: actions.dialogs.closeActiveDialog.trigger,
          },
          open: {
            trigger: actions.dialogs.open.trigger,
          },
        },
        wallets: {
          unselectWallet: { trigger: actions.wallets.unselectWallet.trigger },
          setActiveWallet: { trigger: actions.wallets.setActiveWallet.trigger },
        },
        addresses: {
          setFilter: { trigger: actions.addresses.setFilter.trigger, },
          resetFilter: { trigger: actions.addresses.resetFilter.trigger, },
          resetErrors: {
            trigger: actions.addresses.resetErrors.trigger,
          },
          createAddress: {
            trigger: actions.addresses.createAddress.trigger,
          },
        },
      },
      SidebarContainerProps: (
        { actions, stores }: InjectedOrGenerated<SidebarContainerData>
      ),
      BannerContainerProps: ({ actions, stores }: InjectedOrGenerated<BannerContainerData>),
    });
  }
}
