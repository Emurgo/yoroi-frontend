// @flow
import type { Node } from 'react';
import { Component } from 'react';
import { IntlContext } from 'react-intl';
import { observer } from 'mobx-react';
import { ROUTES } from '../routes-config';
import { genLookupOrFail } from '../stores/stateless/tokenHelpers';
import { networks, getNetworkById } from '../api/ada/lib/storage/database/prepackaged/networks';
import { addressToDisplayString } from '../api/ada/lib/storage/bridge/utils';
import BuySellDialog from '../components/buySell/BuySellDialog';
import NavBarRevamp from '../components/topbar/NavBarRevamp';
import NavWalletDetailsRevamp from '../components/topbar/NavWalletDetailsRevamp';
import WalletListDialog from '../components/topbar/WalletListDialog';
import BuySellAdaButton from '../components/topbar/BuySellAdaButton';
import { MultiToken } from '../api/common/lib/MultiToken';
import LocalStorageApi from '../api/localStorage/index';
import SwitchNetworkDialogContainer from './settings/categories/SwitchNetworkDialogContainer';
import type { StoresProps } from '../stores';
import links from '../links';
// $FlowFixMe[cannot-resolve-module]
import { captureEvent } from '../../posthog';
// $FlowIgnore: suppressing this error
import { createCurrrentWalletInfo } from '../UI/utils/createCurrentWalletInfo';

export const NETWORK_BADGES: {| [number]: {| color: string, text: string |} |} = Object.freeze({
  [networks.CardanoPreprodTestnet.NetworkId]: {
    color: 'rgba(236, 186, 9, 1)',
    text: 'Preprod',
  },
});

type LocalProps = {|
  title: Node,
  menu?: Node,
  pageBanner?: Node,
  isErrorPage?: boolean,
|};

const localStorage = new LocalStorageApi();

@observer
export default class NavBarContainerRevamp extends Component<{| ...StoresProps, ...LocalProps |}> {
  static contextType: any = IntlContext;
  static defaultProps: {| menu: void |} = {
    menu: undefined,
  };

  updateHideBalance: void => Promise<void> = async () => {
    await this.props.stores.profile.updateHideBalance();
  };

  addNewWallet: void => Promise<void> = async () => {
    this.props.stores.uiDialogs.closeActiveDialog();
    this.props.stores.routing.goToRoute({ route: ROUTES.WALLETS.ADD });
    const selectedWallet = this.props.stores.wallets.selected;
    if (selectedWallet) {
      await localStorage.unsetPortfolioFiatPair(selectedWallet.networkId);
    }
  };

  onSelectWallet: number => Promise<void> = async newWalletId => {
    const { delegation, routing } = this.props.stores;
    // <TODO:PENDING_REMOVAL> we are not supporting non-reward wallets anymore, this check will be removed
    const isRewardWallet = delegation.isRewardWallet(newWalletId);
    const isStakingPage = routing.currentRoute === ROUTES.STAKING;
    const isSwapPage = routing.currentRoute.startsWith(ROUTES.SWAP_REVAMP.ASSET_SWAP);
    this.props.stores.wallets.setActiveWallet({ publicDeriverId: newWalletId });
    const selectedWallet = this.props.stores.wallets.selected;
    if (selectedWallet) {
      await localStorage.unsetPortfolioFiatPair(selectedWallet.networkId);
    }
    const route = !isRewardWallet && isStakingPage ? ROUTES.WALLETS.ROOT : routing.currentRoute;
    if (isSwapPage) {
      this.props.stores.routing.goToRoute({ route: ROUTES.SWAP_REVAMP.ASSET_SWAP, query: { newWallet: true } });
    } else {
      this.props.stores.routing.goToRoute({ route });
    }
  };

  render(): Node {
    const { updateHideBalance } = this;
    const { stores, pageBanner, isErrorPage } = this.props;
    const { profile } = stores;
    const currentWalletInfo = createCurrrentWalletInfo(stores);
    const selectedWallet = currentWalletInfo?.selectedWallet;
    const shouldHideBalance = profile.shouldHideBalance;

    const DropdownHead = () => {
      if (!selectedWallet) {
        return null;
      }
      const { plate } = selectedWallet;

      const rewards: MultiToken = stores.delegation.getRewardBalanceOrZero(selectedWallet);

      return (
        <NavWalletDetailsRevamp
          plate={plate}
          name={selectedWallet.name}
          onUpdateHideBalance={updateHideBalance}
          shouldHideBalance={shouldHideBalance}
          rewards={rewards}
          walletAmount={selectedWallet.balance}
          getTokenInfo={genLookupOrFail(stores.tokenInfoStore.tokenInfo)}
          defaultToken={stores.tokenInfoStore.getDefaultTokenInfo(selectedWallet.networkId)}
          unitOfAccountSetting={profile.unitOfAccount}
          getCurrentPrice={stores.coinPriceStore.getCurrentPrice}
          openWalletInfoDialog={() => {
            stores.uiDialogs.open({ dialog: WalletListDialog });
          }}
        />
      );
    };

    let title;
    if (
      this.props.stores.wallets.selected?.networkId === networks.CardanoMainnet.NetworkId ||
      !this.props.stores.wallets.selected
    ) {
      title = this.props.title;
    } else {
      const { color, text } = NETWORK_BADGES[this.props.stores.wallets.selected.networkId];
      title = (
        <div style={{ display: 'flex', flexDirection: 'row' }}>
          {this.props.title}
          <button
            style={{
              backgroundColor: color,
              marginLeft: '8px',
              borderRadius: '16px',
              paddingLeft: '8px',
              paddingRight: '8px',
              cursor: 'pointer',
            }}
            onClick={() => stores.uiDialogs.open({ dialog: SwitchNetworkDialogContainer })}
          >
            {text}
          </button>
        </div>
      );
    }

    const isTestnet = this.props.stores.profile.getCurrentNetworkId() !== networks.CardanoMainnet.NetworkId;

    return (
      <>
        {this.getDialog()}
        <NavBarRevamp
          title={title}
          menu={this.props.menu}
          walletDetails={selectedWallet !== null ? <DropdownHead /> : null}
          buyButton={
            <BuySellAdaButton
              onBuySellClick={() => {
                if (isTestnet) {
                  window.open(links.testnetFaucet, '_blank');
                } else {
                  if (stores.routing.currentRoute.startsWith(ROUTES.WALLETS.ROOT)) {
                    captureEvent('Wallet Page Exchange Clicked');
                  }
                  this.props.stores.uiDialogs.open({ dialog: BuySellDialog });
                }
              }}
              isTestnet={isTestnet}
            />
          }
          isErrorPage={isErrorPage}
          pageBanner={pageBanner}
        />
        {pageBanner && pageBanner}
      </>
    );
  }

  getDialog: void => Node = () => {
    const { stores } = this.props;
    const { selected, wallets } = stores.wallets;
    const getTokenInfo = genLookupOrFail(stores.tokenInfoStore.tokenInfo);
    const shouldHideBalance = stores.profile.shouldHideBalance;

    if (stores.uiDialogs.isOpen(WalletListDialog)) {
      return (
        <WalletListDialog
          cardanoWallets={wallets.map(wallet => ({
            walletId: wallet.publicDeriverId,
            rewards: this.props.stores.delegation.getRewardBalanceOrZero(wallet),
            amount: wallet.balance,
            plate: wallet.plate,
            type: wallet.type,
            name: wallet.name,
          }))}
          onSelect={wallet => {
            this.onSelectWallet(wallet);
          }}
          selectedWalletId={selected?.publicDeriverId}
          close={() => {
            this.props.stores.uiDialogs.closeActiveDialog();
          }}
          shouldHideBalance={shouldHideBalance}
          onUpdateHideBalance={this.updateHideBalance}
          getTokenInfo={getTokenInfo}
          walletAmount={selected?.balance}
          onAddWallet={this.addNewWallet}
          onUpdateWalletListOrder={async (from, to) => {
            await this.props.stores.wallets.reorderWallets(from, to);
          }}
          unitOfAccountSetting={stores.profile.unitOfAccount}
          getCurrentPrice={stores.coinPriceStore.getCurrentPrice}
        />
      );
    }

    if (stores.uiDialogs.isOpen(BuySellDialog)) {
      if (!selected) {
        return null;
      }

      const { numberOfDecimals } = getTokenInfo(selected.balance.getDefaultEntry()).Metadata;

      const receiveAdaAddress = addressToDisplayString(selected.receiveAddress.addr.Hash, getNetworkById(selected.networkId));

      return (
        <BuySellDialog
          onCancel={this.props.stores.uiDialogs.closeActiveDialog}
          onExchangeCallback={() => stores.routing.goToRoute({ route: ROUTES.EXCHANGE_END })}
          currentBalanceAda={selected.balance.getDefault().shiftedBy(-numberOfDecimals)}
          receiveAdaAddress={receiveAdaAddress}
        />
      );
    }

    if (this.props.stores.uiDialogs.isOpen(SwitchNetworkDialogContainer)) {
      return <SwitchNetworkDialogContainer stores={this.props.stores} />;
    }

    return null;
  };
}
