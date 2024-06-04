// @flow
import moment from 'moment';
import { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import type { StoresAndActionsProps } from '../types/injectedProps.types';
import { intlShape } from 'react-intl';
import NavBar from '../components/topbar/NavBar';
import NavPlate from '../components/topbar/NavPlate';
import NavWalletDetails from '../components/topbar/NavWalletDetails';
import NoWalletsDropdown from '../components/topbar/NoWalletsDropdown';
import NavDropdown from '../components/topbar/NavDropdown';
import NavDropdownRow from '../components/topbar/NavDropdownRow';
import { ROUTES } from '../routes-config';
import { asGetPublicKey } from '../api/ada/lib/storage/models/PublicDeriver/traits';
import { PublicDeriver } from '../api/ada/lib/storage/models/PublicDeriver';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { genLookupOrFail } from '../stores/stateless/tokenHelpers';
import BuySellDialog from '../components/buySell/BuySellDialog';
import globalMessages from '../i18n/global-messages';
import { MultiToken } from '../api/common/lib/MultiToken';

type Props = {|
  ...StoresAndActionsProps,
  title: Node,
|};

@observer
export default class NavBarContainer extends Component<Props> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  updateHideBalance: void => Promise<void> = async () => {
    await this.props.actions.profile.updateHideBalance.trigger();
  };

  switchToNewWallet: (number) => void = publicDeriverId => {
    this.props.actions.router.goToRoute.trigger({
      route: this.props.stores.app.currentRoute,
      publicDeriverId,
    });
  };

  openDialogWrapper: any => void = dialog => {
    this.props.actions.router.goToRoute.trigger({ route: ROUTES.MY_WALLETS });
    this.props.actions.dialogs.open.trigger({ dialog });
  };

  render(): Node {
    const { intl } = this.context;
    const { stores } = this.props;
    const { profile, wallets: walletsStore } = stores;
    const { wallets } = walletsStore;

    const walletComponents = wallets.map(wallet => {
      const rewards: MultiToken = this.props.stores.delegation.getRewardBalanceOrZero(
        wallet.publicDeriverId,
        wallet.networkId,
        wallet.defaultTokenId,
      );
      const { lastSyncInfo } = wallet;

      return (
        <NavDropdownRow
          key={wallet.publicDeriverId}
          plateComponent={<NavPlate plate={wallet.plate} walletType={wallet.type} name={wallet.name} />}
          onSelect={() => this.switchToNewWallet(wallet.publicDeriverId)}
          isCurrentWallet={wallet === this.props.stores.wallets.selected}
          syncTime={lastSyncInfo?.Time ? moment(lastSyncInfo.Time).fromNow() : null}
          detailComponent={
            <NavWalletDetails
              walletAmount={wallet.balance}
              rewards={rewards}
              onUpdateHideBalance={this.updateHideBalance}
              shouldHideBalance={profile.shouldHideBalance}
              getTokenInfo={genLookupOrFail(this.props.stores.tokenInfoStore.tokenInfo)}
              defaultToken={this.props.stores.tokenInfoStore.getDefaultTokenInfo(
                wallet.networkId
              )}
              showEyeIcon={false}
              unitOfAccountSetting={profile.unitOfAccount}
              getCurrentPrice={this.props.stores.coinPriceStore.getCurrentPrice}
              purpose='allWallets'
            />
          }
        />
      );
    });
    const dropdownContent = (
      <>
        <NavDropdownRow
          title={intl.formatMessage(globalMessages.allWalletsLabel)}
          detailComponent={undefined}
        />
        {walletComponents}
      </>
    );

    const dropdownComponent = (() => {
      const getDropdownHead = () => {
        const publicDeriver = walletsStore.selected;
        if (publicDeriver == null) {
          return <NoWalletsDropdown />;
        }

        const rewards: MultiToken = this.props.stores.delegation.getRewardBalanceOrZero(
          publicDeriver.publicDeriverId,
          publicDeriver.networkId,
          publicDeriver.defaultTokenId
        );

        return (
          <NavWalletDetails
            onUpdateHideBalance={this.updateHideBalance}
            shouldHideBalance={profile.shouldHideBalance}
            rewards={rewards}
            walletAmount={publicDeriver.balance}
            getTokenInfo={genLookupOrFail(this.props.stores.tokenInfoStore.tokenInfo)}
            defaultToken={this.props.stores.tokenInfoStore.getDefaultTokenInfo(
              publicDeriver.networkId
            )}
            unitOfAccountSetting={profile.unitOfAccount}
            getCurrentPrice={this.props.stores.coinPriceStore.getCurrentPrice}
            purpose='topBar'
          />
        );
      };

      return (
        <NavDropdown
          headerComponent={getDropdownHead()}
          contentComponents={dropdownContent}
          onAddWallet={() =>
            this.props.actions.router.goToRoute.trigger({ route: ROUTES.WALLETS.ADD })
          }
          openBuySellDialog={() => this.openDialogWrapper(BuySellDialog)}
        />
      );
    })();

    const getPlate = () => {
      const { selected } = walletsStore;
      if (selected == null) return null;
      return <NavPlate plate={selected.plate} walletType={selected.type} name={selected.name} />;
    };

    return (
      <NavBar title={this.props.title} walletPlate={getPlate()} walletDetails={dropdownComponent} />
    );
  }
}
