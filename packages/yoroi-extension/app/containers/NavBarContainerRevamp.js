// @flow
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import type { Node } from 'react';
import type { InjectedOrGenerated } from '../types/injectedPropsType';
import type { DelegationRequests } from '../stores/toplevel/DelegationStore';
import type { ConceptualWalletSettingsCache } from '../stores/toplevel/WalletSettingsStore';
import type { PublicKeyCache } from '../stores/toplevel/WalletStore';
import type { IGetPublic } from '../api/ada/lib/storage/models/PublicDeriver/interfaces';
import type { TokenRow } from '../api/ada/lib/storage/database/primitives/tables';
import type { TokenInfoMap } from '../stores/toplevel/TokenInfoStore';
import type { UnitOfAccountSettingType } from '../types/unitOfAccountType';
import type { WalletsNavigation } from '../api/localStorage';
import { computed } from 'mobx';
import { Component } from 'react';
import { intlShape } from 'react-intl';
import { observer } from 'mobx-react';
import { ROUTES } from '../routes-config';
import { ConceptualWallet } from '../api/ada/lib/storage/models/ConceptualWallet/index';
import { asGetPublicKey } from '../api/ada/lib/storage/models/PublicDeriver/traits';
import { PublicDeriver } from '../api/ada/lib/storage/models/PublicDeriver';
import { MultiToken } from '../api/common/lib/MultiToken';
import { genLookupOrFail, getTokenName } from '../stores/stateless/tokenHelpers';
import { networks, isErgo } from '../api/ada/lib/storage/database/prepackaged/networks';
import { addressToDisplayString } from '../api/ada/lib/storage/bridge/utils';
import { getReceiveAddress } from '../stores/stateless/addressStores';
import BuySellDialog from '../components/buySell/BuySellDialog';
import NavBarRevamp from '../components/topbar/NavBarRevamp';
import NavWalletDetailsRevamp from '../components/topbar/NavWalletDetailsRevamp';
import WalletListDialog from '../components/topbar/WalletListDialog';
import BuySellAdaButton from '../components/topbar/BuySellAdaButton';

export type GeneratedData = typeof NavBarContainerRevamp.prototype.generated;

type Props = {|
  ...InjectedOrGenerated<GeneratedData>,
  title: Node,
  menu?: Node,
|};

@observer
export default class NavBarContainerRevamp extends Component<Props> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  static defaultProps: {| menu: void |} = {
    menu: undefined,
  };

  updateHideBalance: void => Promise<void> = async () => {
    await this.generated.actions.profile.updateHideBalance.trigger();
  };

  onSelectWallet: (PublicDeriver<>) => void = newWallet => {
    const { delegation, app } = this.generated.stores;
    const isRewardWallet = !!delegation.getDelegationRequests(newWallet);
    const isStakingPage = app.currentRoute === ROUTES.STAKING;

    const route = !isRewardWallet && isStakingPage ? ROUTES.WALLETS.ROOT : app.currentRoute;
    this.generated.actions.router.goToRoute.trigger({ route, publicDeriver: newWallet });
  };

  openDialogWrapper: any => void = dialog => {
    this.generated.actions.router.goToRoute.trigger({ route: ROUTES.MY_WALLETS });
    this.generated.actions.dialogs.open.trigger({ dialog });
  };

  render(): Node {
    const { stores } = this.generated;
    const { profile } = stores;
    const walletsStore = stores.wallets;

    const DropdownHead = () => {
      const publicDeriver = walletsStore.selected;
      if (publicDeriver == null) return null;
      const parent = publicDeriver.getParent();
      const settingsCache = this.generated.stores.walletSettings.getConceptualWalletSettingsCache(
        parent
      );

      const withPubKey = asGetPublicKey(publicDeriver);
      const plate =
        withPubKey == null
          ? null
          : this.generated.stores.wallets.getPublicKeyCache(withPubKey).plate;

      const balance = this.generated.stores.transactions.getBalance(publicDeriver);

      return (
        <NavWalletDetailsRevamp
          plate={plate}
          wallet={settingsCache}
          onUpdateHideBalance={this.updateHideBalance}
          shouldHideBalance={profile.shouldHideBalance}
          rewards={this.getRewardBalance(publicDeriver)}
          walletAmount={balance}
          getTokenInfo={genLookupOrFail(this.generated.stores.tokenInfoStore.tokenInfo)}
          defaultToken={this.generated.stores.tokenInfoStore.getDefaultTokenInfo(
            publicDeriver.getParent().getNetworkInfo().NetworkId
          )}
          unitOfAccountSetting={profile.unitOfAccount}
          getCurrentPrice={this.generated.stores.coinPriceStore.getCurrentPrice}
          openWalletInfoDialog={() => {
            this.generated.actions.dialogs.open.trigger({ dialog: WalletListDialog });
          }}
        />
      );
    };

    return (
      <>
        {this.getDialog()}
        <NavBarRevamp
          title={this.props.title}
          menu={this.props.menu}
          walletDetails={walletsStore.selected !== null ? <DropdownHead /> : null}
          buyButton={
            <BuySellAdaButton
              onBuySellClick={() =>
                this.generated.actions.dialogs.open.trigger({ dialog: BuySellDialog })
              }
            />
          }
        />
      </>
    );
  }

  getDialog: void => Node = () => {
    const publicDeriver = this.generated.stores.wallets.selected;
    const wallets = this.generated.stores.wallets.publicDerivers;
    let balance;
    if (publicDeriver) {
      balance = this.generated.stores.transactions.getBalance(publicDeriver);
    }

    const ergoWallets = [];
    const cardanoWallets = [];

    wallets.forEach(wallet => {
      const walletBalance = this.generated.stores.transactions.getBalance(wallet);
      const parent = wallet.getParent();
      const settingsCache = this.generated.stores.walletSettings.getConceptualWalletSettingsCache(
        parent
      );

      const withPubKey = asGetPublicKey(wallet);
      const plate =
        withPubKey == null
          ? null
          : this.generated.stores.wallets.getPublicKeyCache(withPubKey).plate;

      const walletMap = {
        walletId: wallet.getPublicDeriverId(),
        rewards: this.getRewardBalance(wallet),
        walletAmount: walletBalance,
        getTokenInfo: genLookupOrFail(this.generated.stores.tokenInfoStore.tokenInfo),
        plate,
        wallet,
        settingsCache,
        shouldHideBalance: this.generated.stores.profile.shouldHideBalance,
      };

      if (isErgo(wallet.getParent().getNetworkInfo())) ergoWallets.push(walletMap);
      else cardanoWallets.push(walletMap);
    });

    if (this.generated.stores.uiDialogs.isOpen(WalletListDialog)) {
      return (
        <WalletListDialog
          cardanoWallets={cardanoWallets}
          ergoWallets={ergoWallets}
          onSelect={this.onSelectWallet}
          selectedWallet={this.generated.stores.wallets.selected}
          close={this.generated.actions.dialogs.closeActiveDialog.trigger}
          shouldHideBalance={this.generated.stores.profile.shouldHideBalance}
          onUpdateHideBalance={this.updateHideBalance}
          getTokenInfo={genLookupOrFail(this.generated.stores.tokenInfoStore.tokenInfo)}
          walletAmount={balance}
          onAddWallet={() => {
            this.generated.actions.dialogs.closeActiveDialog.trigger();
            this.generated.actions.router.goToRoute.trigger({ route: ROUTES.WALLETS.ADD });
          }}
          updateSortedWalletList={this.generated.actions.profile.updateSortedWalletList.trigger}
          walletsNavigation={this.generated.stores.profile.walletsNavigation}
          unitOfAccountSetting={this.generated.stores.profile.unitOfAccount}
          getCurrentPrice={this.generated.stores.coinPriceStore.getCurrentPrice}
        />
      );
    }
    if (this.generated.stores.uiDialogs.isOpen(BuySellDialog)) {
      return (
        <BuySellDialog
          onCancel={this.generated.actions.dialogs.closeActiveDialog.trigger}
          genWalletList={async () => {
            return await this.generateUnusedAddressesPerWallet(wallets);
          }}
        />
      );
    }
    return null;
  };

  generateUnusedAddressesPerWallet: (Array<PublicDeriver<>>) => Promise<Array<any>> = async (
    wallets: Array<PublicDeriver<>>
  ) => {
    const infoWallets = wallets.map(async (wallet: PublicDeriver<>) => {
      const parent: ConceptualWallet = wallet.getParent();
      const settingsCache: ConceptualWalletSettingsCache = this.generated.stores.walletSettings.getConceptualWalletSettingsCache(
        parent
      );

      const defaultToken = this.generated.stores.tokenInfoStore.getDefaultTokenInfo(
        wallet.getParent().getNetworkInfo().NetworkId
      );
      const currencyName = getTokenName(defaultToken);

      if (defaultToken.NetworkId !== networks.CardanoMainnet.NetworkId) {
        return null;
      }

      const receiveAddress = await this.generated.getReceiveAddress(wallet);
      if (receiveAddress == null) return null;
      const anAddressFormatted = addressToDisplayString(
        receiveAddress.addr.Hash,
        parent.getNetworkInfo()
      );

      return {
        walletName: settingsCache.conceptualWalletName,
        currencyName,
        anAddressFormatted,
      };
    });

    return (await Promise.all(infoWallets)).reduce((acc, next) => {
      if (next == null) return acc;
      acc.push(next);
      return acc;
    }, []);
  };

  /**
   * undefined => wallet is not a reward wallet
   * null => still calculating
   * value => done calculating
   */
  getRewardBalance: (PublicDeriver<>) => null | void | MultiToken = publicDeriver => {
    const delegationRequest = this.generated.stores.delegation.getDelegationRequests(publicDeriver);
    if (delegationRequest == null) return undefined;

    const balanceResult = delegationRequest.getDelegatedBalance.result;
    if (balanceResult == null) {
      return null;
    }
    return balanceResult.accountPart;
  };

  @computed get generated(): {|
    actions: {|
      dialogs: {|
        open: {|
          trigger: (params: {|
            dialog: any,
            params?: any,
          |}) => void,
        |},
        closeActiveDialog: {|
          trigger: (params: void) => void,
        |},
      |},
      profile: {|
        updateHideBalance: {|
          trigger: (params: void) => Promise<void>,
        |},
        updateSortedWalletList: {|
          trigger: WalletsNavigation => Promise<void>,
        |},
      |},
      router: {|
        goToRoute: {|
          trigger: (params: {|
            publicDeriver?: null | PublicDeriver<>,
            params?: ?any,
            route: string,
          |}) => void,
        |},
      |},
      wallets: {|
        setActiveWallet: {|
          trigger: (params: {|
            wallet: PublicDeriver<>,
          |}) => void,
        |},
      |},
    |},
    stores: {|
      app: {| currentRoute: string |},
      uiDialogs: {| isOpen: any => boolean |},
      delegation: {|
        getDelegationRequests: (PublicDeriver<>) => void | DelegationRequests,
      |},
      profile: {|
        shouldHideBalance: boolean,
        unitOfAccount: UnitOfAccountSettingType,
        walletsNavigation: WalletsNavigation,
      |},
      tokenInfoStore: {|
        tokenInfo: TokenInfoMap,
        getDefaultTokenInfo: number => $ReadOnly<TokenRow>,
      |},
      transactions: {|
        getBalance: (PublicDeriver<>) => MultiToken | null,
      |},
      walletSettings: {|
        getConceptualWalletSettingsCache: ConceptualWallet => ConceptualWalletSettingsCache,
      |},
      wallets: {|
        getPublicKeyCache: IGetPublic => PublicKeyCache,
        publicDerivers: Array<PublicDeriver<>>,
        selected: null | PublicDeriver<>,
      |},
      coinPriceStore: {|
        getCurrentPrice: (from: string, to: string) => ?string,
      |},
    |},
    getReceiveAddress: typeof getReceiveAddress,
  |} {
    if (this.props.generated !== undefined) {
      return this.props.generated;
    }
    if (this.props.stores == null || this.props.actions == null) {
      throw new Error(`${nameof(NavBarContainerRevamp)} no way to generated props`);
    }
    const { stores, actions } = this.props;
    return Object.freeze({
      getReceiveAddress,
      stores: {
        app: {
          currentRoute: stores.app.currentRoute,
        },
        walletSettings: {
          getConceptualWalletSettingsCache: stores.walletSettings.getConceptualWalletSettingsCache,
        },
        wallets: {
          selected: stores.wallets.selected,
          publicDerivers: stores.wallets.publicDerivers,
          getPublicKeyCache: stores.wallets.getPublicKeyCache,
        },
        tokenInfoStore: {
          tokenInfo: stores.tokenInfoStore.tokenInfo,
          getDefaultTokenInfo: stores.tokenInfoStore.getDefaultTokenInfo,
        },
        uiDialogs: {
          isOpen: stores.uiDialogs.isOpen,
        },
        profile: {
          shouldHideBalance: stores.profile.shouldHideBalance,
          unitOfAccount: stores.profile.unitOfAccount,
          walletsNavigation: stores.profile.walletsNavigation,
        },
        delegation: {
          getDelegationRequests: stores.delegation.getDelegationRequests,
        },
        transactions: {
          getBalance: stores.transactions.getBalance,
        },
        coinPriceStore: {
          getCurrentPrice: stores.coinPriceStore.getCurrentPrice,
        },
      },
      actions: {
        wallets: {
          setActiveWallet: { trigger: actions.wallets.setActiveWallet.trigger },
        },
        profile: {
          updateHideBalance: { trigger: actions.profile.updateHideBalance.trigger },
          updateSortedWalletList: { trigger: actions.profile.updateSortedWalletList.trigger },
        },
        router: {
          goToRoute: { trigger: actions.router.goToRoute.trigger },
        },
        dialogs: {
          open: { trigger: actions.dialogs.open.trigger },
          closeActiveDialog: { trigger: actions.dialogs.closeActiveDialog.trigger },
        },
      },
    });
  }
}
