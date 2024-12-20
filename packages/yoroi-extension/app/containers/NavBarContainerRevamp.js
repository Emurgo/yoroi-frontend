// @flow
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import type { Node } from 'react';
import type { StoresAndActionsProps } from '../types/injectedProps.types';
import { Component } from 'react';
import { intlShape } from 'react-intl';
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
import { ampli } from '../../ampli/index';
import { MultiToken } from '../api/common/lib/MultiToken';
import LocalStorageApi from '../api/localStorage/index';
import SwitchNetworkDialogContainer from './settings/categories/SwitchNetworkDialogContainer';

const NETWORK_BADGES = Object.freeze({
  [networks.CardanoPreprodTestnet.NetworkId]: {
    color: 'rgba(236, 186, 9, 1)',
    text: 'preprod',
  },
  [networks.CardanoPreviewTestnet.NetworkId]: {
    color: 'rgba(143, 201, 246, 1)',
    text: 'preview',
  },
  [networks.CardanoSanchoTestnet.NetworkId]: {
    color: 'rgba(147, 245, 225, 1)',
    text: 'sancho',
  },
});

type Props = {|
  ...StoresAndActionsProps,
  title: Node,
  menu?: Node,
  pageBanner?: Node,
  isErrorPage?: boolean,
|};

const localStorage = new LocalStorageApi();

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

  addNewWallet: void => Promise<void> = async () => {
    this.props.actions.dialogs.closeActiveDialog.trigger();
    this.props.actions.router.goToRoute.trigger({ route: ROUTES.WALLETS.ADD });
    await localStorage.unsetPortfolioFiatPair();
  };

  onSelectWallet: number => Promise<void> = async newWalletId => {
    const { delegation, app } = this.props.stores;
    // <TODO:PENDING_REMOVAL> we are not supporting non-reward wallets anymore, this check will be removed
    const isRewardWallet = delegation.isRewardWallet(newWalletId);
    const isStakingPage = app.currentRoute === ROUTES.STAKING;
    await localStorage.unsetPortfolioFiatPair();
    const route = !isRewardWallet && isStakingPage ? ROUTES.WALLETS.ROOT : app.currentRoute;
    this.props.actions.router.goToRoute.trigger({ route, publicDeriverId: newWalletId });
  };

  checkAndResetGovRoutes: void => void = () => {
    if (
      this.props.stores.app.currentRoute === ROUTES.Governance.FAIL ||
      this.props.stores.app.currentRoute === ROUTES.Governance.SUBMITTED
    ) {
      this.props.actions.router.goToRoute.trigger({ route: ROUTES.Governance.ROOT });
    }
  };

  render(): Node {
    const { stores, pageBanner, isErrorPage } = this.props;
    const { profile, wallets } = stores;
    const { selected, selectedWalletName } = wallets;

    const DropdownHead = () => {
      if (!selected || !selectedWalletName) {
        return null;
      }
      const { plate } = selected;

      const rewards: MultiToken = this.props.stores.delegation.getRewardBalanceOrZero(selected);

      return (
        <NavWalletDetailsRevamp
          plate={plate}
          name={selectedWalletName}
          onUpdateHideBalance={this.updateHideBalance}
          shouldHideBalance={profile.shouldHideBalance}
          rewards={rewards}
          walletAmount={selected.balance}
          getTokenInfo={genLookupOrFail(this.props.stores.tokenInfoStore.tokenInfo)}
          defaultToken={this.props.stores.tokenInfoStore.getDefaultTokenInfo(selected.networkId)}
          unitOfAccountSetting={profile.unitOfAccount}
          getCurrentPrice={this.props.stores.coinPriceStore.getCurrentPrice}
          openWalletInfoDialog={() => {
            ampli.allWalletsPageViewed();
            this.props.actions.dialogs.open.trigger({ dialog: WalletListDialog });
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
            }}
            onClick={() => this.props.actions.dialogs.open.trigger({ dialog: SwitchNetworkDialogContainer })}
          >
            {text}
          </button>
        </div>
      );
    }

    return (
      <>
        {this.getDialog()}
        <NavBarRevamp
          title={title}
          menu={this.props.menu}
          walletDetails={selected !== null ? <DropdownHead /> : null}
          buyButton={
            <BuySellAdaButton onBuySellClick={() => this.props.actions.dialogs.open.trigger({ dialog: BuySellDialog })} />
          }
          isErrorPage={isErrorPage}
          pageBanner={pageBanner}
        />
        {pageBanner && pageBanner}
      </>
    );
  }

  getDialog: void => Node = () => {
    const { selected, wallets } = this.props.stores.wallets;
    const getTokenInfo = genLookupOrFail(this.props.stores.tokenInfoStore.tokenInfo);

    if (this.props.stores.uiDialogs.isOpen(WalletListDialog)) {
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
            this.checkAndResetGovRoutes();
            this.onSelectWallet(wallet);
          }}
          selectedWalletId={selected?.publicDeriverId}
          close={() => {
            this.checkAndResetGovRoutes();
            this.props.actions.dialogs.closeActiveDialog.trigger();
          }}
          shouldHideBalance={this.props.stores.profile.shouldHideBalance}
          onUpdateHideBalance={this.updateHideBalance}
          getTokenInfo={getTokenInfo}
          walletAmount={selected?.balance}
          onAddWallet={this.addNewWallet}
          onUpdateWalletListOrder={async (from, to) => {
            await this.props.stores.wallets.reorderWallets(from, to);
          }}
          unitOfAccountSetting={this.props.stores.profile.unitOfAccount}
          getCurrentPrice={this.props.stores.coinPriceStore.getCurrentPrice}
        />
      );
    }

    if (this.props.stores.uiDialogs.isOpen(BuySellDialog)) {
      if (!selected) {
        return null;
      }

      const { numberOfDecimals } = getTokenInfo(selected.balance.getDefaultEntry()).Metadata;

      const receiveAdaAddress = addressToDisplayString(selected.receiveAddress.addr.Hash, getNetworkById(selected.networkId));

      return (
        <BuySellDialog
          onCancel={this.props.actions.dialogs.closeActiveDialog.trigger}
          onExchangeCallback={() => this.props.actions.router.goToRoute.trigger({ route: ROUTES.EXCHANGE_END })}
          currentBalanceAda={selected.balance.getDefault().shiftedBy(-numberOfDecimals)}
          receiveAdaAddress={receiveAdaAddress}
        />
      );
    }

    if (this.props.stores.uiDialogs.isOpen(SwitchNetworkDialogContainer)) {
      return <SwitchNetworkDialogContainer actions={this.props.actions} stores={this.props.stores} />;
    }

    return null;
  };

}
