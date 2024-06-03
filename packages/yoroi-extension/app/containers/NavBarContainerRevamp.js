// @flow
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import type { Node } from 'react';
import type { StoresAndActionsProps } from '../types/injectedProps.types';
import { Component } from 'react';
import { intlShape } from 'react-intl';
import { observer } from 'mobx-react';
import { ROUTES } from '../routes-config';
import { asGetPublicKey } from '../api/ada/lib/storage/models/PublicDeriver/traits';
import { PublicDeriver } from '../api/ada/lib/storage/models/PublicDeriver';
import { genLookupOrFail } from '../stores/stateless/tokenHelpers';
import { addressToDisplayString } from '../api/ada/lib/storage/bridge/utils';
import { getReceiveAddress } from '../stores/stateless/addressStores';
import BuySellDialog from '../components/buySell/BuySellDialog';
import NavBarRevamp from '../components/topbar/NavBarRevamp';
import NavWalletDetailsRevamp from '../components/topbar/NavWalletDetailsRevamp';
import WalletListDialog from '../components/topbar/WalletListDialog';
import BuySellAdaButton from '../components/topbar/BuySellAdaButton';
import { ampli } from '../../ampli/index';
import { MultiToken } from '../api/common/lib/MultiToken';

type Props = {|
  ...StoresAndActionsProps,
  title: Node,
  menu?: Node,
  pageBanner?: Node,
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
    const isRewardWallet = delegation.isRewardWallet(newWallet);
    const isStakingPage = app.currentRoute === ROUTES.STAKING;

    const route = !isRewardWallet && isStakingPage ? ROUTES.WALLETS.ROOT : app.currentRoute;
    this.props.actions.router.goToRoute.trigger({ route, publicDeriver: newWallet });
  };

  render(): Node {
    const { stores, pageBanner } = this.props;
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
        withPubKey == null ? null : this.props.stores.wallets.getPublicKeyCache(withPubKey).plate;

      const balance: ?MultiToken = this.props.stores.transactions.getBalance(publicDeriver);
      const rewards: MultiToken = this.props.stores.delegation.getRewardBalanceOrZero(
        publicDeriver
      );

      return (
        <NavWalletDetailsRevamp
          plate={plate}
          wallet={settingsCache}
          onUpdateHideBalance={this.updateHideBalance}
          shouldHideBalance={profile.shouldHideBalance}
          rewards={rewards}
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
          pageBanner={pageBanner}
        />
        {pageBanner && pageBanner}
      </>
    );
  }

  getDialog: void => Node = () => {
    const publicDeriver = this.props.stores.wallets.selected;
    let balance;
    if (publicDeriver) {
      balance = this.props.stores.transactions.getBalance(publicDeriver);
    }
    const getTokenInfo = genLookupOrFail(this.props.stores.tokenInfoStore.tokenInfo);

    if (this.props.stores.uiDialogs.isOpen(WalletListDialog)) {
      const cardanoWallets = [];

      this.props.stores.wallets.publicDerivers.forEach(wallet => {
        const walletAmount = this.props.stores.transactions.getBalance(wallet);
        const rewards = this.props.stores.delegation.getRewardBalanceOrZero(wallet);
        const parent = wallet.getParent();
        const settingsCache = this.props.stores.walletSettings.getConceptualWalletSettingsCache(
          parent
        );

        const withPubKey = asGetPublicKey(wallet);
        const plate =
          withPubKey == null ? null : this.props.stores.wallets.getPublicKeyCache(withPubKey).plate;

        const walletMap = {
          walletId: wallet.getPublicDeriverId(),
          rewards,
          walletAmount,
          getTokenInfo: genLookupOrFail(this.props.stores.tokenInfoStore.tokenInfo),
          plate,
          wallet,
          settingsCache,
          shouldHideBalance: this.props.stores.profile.shouldHideBalance,
        };

        cardanoWallets.push(walletMap);
      });

      return (
        <WalletListDialog
          cardanoWallets={cardanoWallets}
          onSelect={this.onSelectWallet}
          selectedWallet={this.props.stores.wallets.selected}
          close={this.props.actions.dialogs.closeActiveDialog.trigger}
          shouldHideBalance={this.props.stores.profile.shouldHideBalance}
          onUpdateHideBalance={this.updateHideBalance}
          getTokenInfo={getTokenInfo}
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
      if (!publicDeriver || !balance) {
        return null;
      }
      const getReceiveAdaAddress = async () => {
        const receiveAddress = await getReceiveAddress(publicDeriver);
        if (receiveAddress == null) return null;
        return addressToDisplayString(
          receiveAddress.addr.Hash,
          publicDeriver.getParent().getNetworkInfo()
        );
      };

      const tokenInfo = getTokenInfo(balance.getDefaultEntry());
      const { numberOfDecimals } = tokenInfo.Metadata;

      return (
        <BuySellDialog
          onCancel={this.props.actions.dialogs.closeActiveDialog.trigger}
          onExchangeCallback={() =>
            this.props.actions.router.goToRoute.trigger({ route: ROUTES.EXCHANGE_END })
          }
          currentBalanceAda={balance
            .getDefault()
            .shiftedBy(-numberOfDecimals)
            .toFormat(numberOfDecimals)}
          receiveAdaAddressPromise={getReceiveAdaAddress()}
        />
      );
    }

    return null;
  };
}
