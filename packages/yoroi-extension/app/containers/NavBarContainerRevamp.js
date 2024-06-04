// @flow
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import type { Node } from 'react';
import type { StoresAndActionsProps } from '../types/injectedProps.types';
import { Component } from 'react';
import { intlShape } from 'react-intl';
import { observer } from 'mobx-react';
import { ROUTES } from '../routes-config';
import { ConceptualWallet } from '../api/ada/lib/storage/models/ConceptualWallet/index';
import { genLookupOrFail, getTokenName } from '../stores/stateless/tokenHelpers';
import { networks, getNetworkById } from '../api/ada/lib/storage/database/prepackaged/networks';
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

  onSelectWallet: (number) => void = newWalletId => {
    const { delegation, app } = this.props.stores;
    // <TODO:PENDING_REMOVAL> we are not supporting non-reward wallets anymore, this check will be removed
    const isRewardWallet = delegation.isRewardWallet(newWalletId);
    const isStakingPage = app.currentRoute === ROUTES.STAKING;

    const route = !isRewardWallet && isStakingPage ? ROUTES.WALLETS.ROOT : app.currentRoute;
    this.props.actions.router.goToRoute.trigger({ route, publicDeriverId: newWalletId });
  };

  openDialogWrapper: any => void = dialog => {
    this.props.actions.router.goToRoute.trigger({ route: ROUTES.MY_WALLETS });
    this.props.actions.dialogs.open.trigger({ dialog });
  };

  render(): Node {
    const { stores } = this.props;
    const { profile } = stores;
    const { selected } = stores.wallets;

    const DropdownHead = () => {
      if (!selected) {
        return null;
      }
      const { plate }= selected;

      const rewards: MultiToken = this.props.stores.delegation.getRewardBalanceOrZero(
        selected.publicDeriverId,
        selected.networkId,
        selected.defaultTokenId
      );

      return (
        <NavWalletDetailsRevamp
          plate={plate}
          name={selected.name}
          onUpdateHideBalance={this.updateHideBalance}
          shouldHideBalance={profile.shouldHideBalance}
          rewards={rewards}
          walletAmount={selected.balance}
          getTokenInfo={genLookupOrFail(this.props.stores.tokenInfoStore.tokenInfo)}
          defaultToken={this.props.stores.tokenInfoStore.getDefaultTokenInfo(
            selected.publicDeriverId,
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
          walletDetails={selected !== null ? <DropdownHead /> : null}
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
    const { selected, wallets } = this.props.stores.wallets;

    if (this.props.stores.uiDialogs.isOpen(WalletListDialog)) {
      const cardanoWallets = [];

      wallets.forEach(wallet => {
        const rewards = this.props.stores.delegation.getRewardBalanceOrZero(
          wallet.publicDeriverId,
          wallet.networkId,
          wallet.defaultTokenId
        );

        const walletMap = {
          walletId: wallet.publicDeriverId,
          rewards,
          amount: wallet.balance,
          plate: wallet.plate,
          type: wallet.type,
          name: wallet.name,
        };

        cardanoWallets.push(walletMap);
      });

      return (
        <WalletListDialog
          cardanoWallets={cardanoWallets}
          onSelect={this.onSelectWallet}
          selectedWalletId={selected?.publicDeriverId}
          close={this.props.actions.dialogs.closeActiveDialog.trigger}
          shouldHideBalance={this.props.stores.profile.shouldHideBalance}
          onUpdateHideBalance={this.updateHideBalance}
          getTokenInfo={genLookupOrFail(this.props.stores.tokenInfoStore.tokenInfo)}
          walletAmount={selected?.balance}
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
      if (!selected) {
        return null;
      }
      const formattedAddress = addressToDisplayString(
        selected.receiveAddress.addr.Hash,
        getNetworkById(selected.networkId),
      );

      return (
        <BuySellDialog
          onCancel={this.props.actions.dialogs.closeActiveDialog.trigger}
          walletList={wallets.map(wallet => {
            const defaultToken = this.props.stores.tokenInfoStore.getDefaultTokenInfo(
              selected.networkId,
            );
            const currencyName = getTokenName(defaultToken);

            return {
              walletName: selected.name,
              currencyName,
              anAddressFormatted: formattedAddress,
            };
          })}
        />
      );
    }
    return null;
  };

}
