// @flow
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import type { Node } from 'react';
import type { InjectedProps } from '../types/injectedPropsType';
import type { ConceptualWalletSettingsCache } from '../stores/toplevel/WalletSettingsStore';
import { Component } from 'react';
import { intlShape } from 'react-intl';
import { observer } from 'mobx-react';
import { ROUTES } from '../routes-config';
import { ConceptualWallet } from '../api/ada/lib/storage/models/ConceptualWallet/index';
import { asGetPublicKey } from '../api/ada/lib/storage/models/PublicDeriver/traits';
import { PublicDeriver } from '../api/ada/lib/storage/models/PublicDeriver';
import { MultiToken } from '../api/common/lib/MultiToken';
import { genLookupOrFail, getTokenName } from '../stores/stateless/tokenHelpers';
import { networks } from '../api/ada/lib/storage/database/prepackaged/networks';
import { addressToDisplayString } from '../api/ada/lib/storage/bridge/utils';
import { getReceiveAddress } from '../stores/stateless/addressStores';
import BuySellDialog from '../components/buySell/BuySellDialog';
import NavBarRevamp from '../components/topbar/NavBarRevamp';
import NavWalletDetailsRevamp from '../components/topbar/NavWalletDetailsRevamp';
import WalletListDialog from '../components/topbar/WalletListDialog';
import BuySellAdaButton from '../components/topbar/BuySellAdaButton';
import { ampli } from '../../ampli/index';

type Props = {|
  ...InjectedProps,
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
    await this.props.actions.profile.updateHideBalance.trigger();
  };

  onSelectWallet: (PublicDeriver<>) => void = newWallet => {
    const { delegation, app } = this.props.stores;
    const isRewardWallet = !!delegation.getDelegationRequests(newWallet);
    const isStakingPage = app.currentRoute === ROUTES.STAKING;

    const route = !isRewardWallet && isStakingPage ? ROUTES.WALLETS.ROOT : app.currentRoute;
    this.props.actions.router.goToRoute.trigger({ route, publicDeriver: newWallet });
  };

  openDialogWrapper: any => void = dialog => {
    this.props.actions.router.goToRoute.trigger({ route: ROUTES.MY_WALLETS });
    this.props.actions.dialogs.open.trigger({ dialog });
  };

  render(): Node {
    const { stores } = this.props;
    const { profile } = stores;
    const walletsStore = stores.wallets;

    const DropdownHead = () => {
      const publicDeriver = walletsStore.selected;
      if (publicDeriver == null) return null;
      const parent = publicDeriver.getParent();
      const settingsCache = this.props.stores.walletSettings.getConceptualWalletSettingsCache(
        parent
      );

      const withPubKey = asGetPublicKey(publicDeriver);
      const plate =
        withPubKey == null
          ? null
          : this.props.stores.wallets.getPublicKeyCache(withPubKey).plate;

      const balance = this.props.stores.transactions.getBalance(publicDeriver);

      return (
        <NavWalletDetailsRevamp
          plate={plate}
          wallet={settingsCache}
          onUpdateHideBalance={this.updateHideBalance}
          shouldHideBalance={profile.shouldHideBalance}
          rewards={this.getRewardBalance(publicDeriver)}
          walletAmount={balance}
          getTokenInfo={genLookupOrFail(this.props.stores.tokenInfoStore.tokenInfo)}
          defaultToken={this.props.stores.tokenInfoStore.getDefaultTokenInfo(
            publicDeriver.getParent().getNetworkInfo().NetworkId
          )}
          unitOfAccountSetting={profile.unitOfAccount}
          getCurrentPrice={this.props.stores.coinPriceStore.getCurrentPrice}
          openWalletInfoDialog={() => {
            ampli.allWalletsPageViewed();
            this.props.actions.dialogs.open.trigger({ dialog: WalletListDialog });
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
                this.props.actions.dialogs.open.trigger({ dialog: BuySellDialog })
              }
            />
          }
        />
      </>
    );
  }

  getDialog: void => Node = () => {
    const publicDeriver = this.props.stores.wallets.selected;
    const wallets = this.props.stores.wallets.publicDerivers;
    let balance;
    if (publicDeriver) {
      balance = this.props.stores.transactions.getBalance(publicDeriver);
    }

    const cardanoWallets = [];

    wallets.forEach(wallet => {
      const walletBalance = this.props.stores.transactions.getBalance(wallet);
      const parent = wallet.getParent();
      const settingsCache = this.props.stores.walletSettings.getConceptualWalletSettingsCache(
        parent
      );

      const withPubKey = asGetPublicKey(wallet);
      const plate =
        withPubKey == null
          ? null
          : this.props.stores.wallets.getPublicKeyCache(withPubKey).plate;

      const walletMap = {
        walletId: wallet.getPublicDeriverId(),
        rewards: this.getRewardBalance(wallet),
        walletAmount: walletBalance,
        getTokenInfo: genLookupOrFail(this.props.stores.tokenInfoStore.tokenInfo),
        plate,
        wallet,
        settingsCache,
        shouldHideBalance: this.props.stores.profile.shouldHideBalance,
      };

      cardanoWallets.push(walletMap);
    });

    if (this.props.stores.uiDialogs.isOpen(WalletListDialog)) {
      return (
        <WalletListDialog
          cardanoWallets={cardanoWallets}
          onSelect={this.onSelectWallet}
          selectedWallet={this.props.stores.wallets.selected}
          close={this.props.actions.dialogs.closeActiveDialog.trigger}
          shouldHideBalance={this.props.stores.profile.shouldHideBalance}
          onUpdateHideBalance={this.updateHideBalance}
          getTokenInfo={genLookupOrFail(this.props.stores.tokenInfoStore.tokenInfo)}
          walletAmount={balance}
          onAddWallet={() => {
            this.props.actions.dialogs.closeActiveDialog.trigger();
            this.props.actions.router.goToRoute.trigger({ route: ROUTES.WALLETS.ADD });
          }}
          updateSortedWalletList={this.props.actions.profile.updateSortedWalletList.trigger}
          walletsNavigation={this.props.stores.profile.walletsNavigation}
          unitOfAccountSetting={this.props.stores.profile.unitOfAccount}
          getCurrentPrice={this.props.stores.coinPriceStore.getCurrentPrice}
        />
      );
    }
    if (this.props.stores.uiDialogs.isOpen(BuySellDialog)) {
      return (
        <BuySellDialog
          onCancel={this.props.actions.dialogs.closeActiveDialog.trigger}
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
      const settingsCache: ConceptualWalletSettingsCache = this.props.stores.walletSettings.getConceptualWalletSettingsCache(
        parent
      );

      const defaultToken = this.props.stores.tokenInfoStore.getDefaultTokenInfo(
        wallet.getParent().getNetworkInfo().NetworkId
      );
      const currencyName = getTokenName(defaultToken);

      if (defaultToken.NetworkId !== networks.CardanoMainnet.NetworkId) {
        return null;
      }

      const receiveAddress = await getReceiveAddress(wallet);
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
    const delegationRequest = this.props.stores.delegation.getDelegationRequests(publicDeriver);
    if (delegationRequest == null) return undefined;

    const balanceResult = delegationRequest.getDelegatedBalance.result;
    if (balanceResult == null) {
      return null;
    }
    return balanceResult.accountPart;
  };
}
