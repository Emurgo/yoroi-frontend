// @flow
import { observer } from 'mobx-react';
import moment from 'moment';
import type { Node } from 'react';
import { Component } from 'react';
import { intlShape } from 'react-intl';
import { PublicDeriver } from '../api/ada/lib/storage/models/PublicDeriver';
import { asGetPublicKey } from '../api/ada/lib/storage/models/PublicDeriver/traits';
import { MultiToken } from '../api/common/lib/MultiToken';
import BuySellDialog from '../components/buySell/BuySellDialog';
import NavBar from '../components/topbar/NavBar';
import NavDropdown from '../components/topbar/NavDropdown';
import NavDropdownRow from '../components/topbar/NavDropdownRow';
import NavPlate from '../components/topbar/NavPlate';
import NavWalletDetails from '../components/topbar/NavWalletDetails';
import NoWalletsDropdown from '../components/topbar/NoWalletsDropdown';
import globalMessages from '../i18n/global-messages';
import { ROUTES } from '../routes-config';
import { genLookupOrFail } from '../stores/stateless/tokenHelpers';

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

  switchToNewWallet: (PublicDeriver<>) => void = newWallet => {
    this.props.actions.router.goToRoute.trigger({
      route: this.props.stores.app.currentRoute,
      publicDeriver: newWallet,
    });
  };

  openDialogWrapper: any => void = dialog => {
    this.props.actions.router.goToRoute.trigger({ route: ROUTES.MY_WALLETS });
    this.props.actions.dialogs.open.trigger({ dialog });
  };

  render(): Node {
    const { intl } = this.context;
    const { stores } = this.props;
    const { profile } = stores;

    const walletsStore = stores.wallets;

    const wallets = this.props.stores.wallets.publicDerivers;

    const walletComponents = wallets.map(wallet => {
      const balance: ?MultiToken = this.props.stores.transactions.getBalance(wallet);
      const rewards: MultiToken = this.props.stores.delegation.getRewardBalanceOrZero(wallet);
      const lastSyncInfo = this.props.stores.transactions.lastSyncInfo;

      const parent = wallet.getParent();
      const settingsCache = this.props.stores.walletSettings.getConceptualWalletSettingsCache(parent);

      const withPubKey = asGetPublicKey(wallet);
      const plate = withPubKey == null ? null : this.props.stores.wallets.getPublicKeyCache(withPubKey).plate;

      return (
        <NavDropdownRow
          key={wallet.getPublicDeriverId()}
          plateComponent={<NavPlate plate={plate} wallet={settingsCache} />}
          onSelect={() => this.switchToNewWallet(wallet)}
          isCurrentWallet={wallet === this.props.stores.wallets.selected}
          syncTime={lastSyncInfo?.Time ? moment(lastSyncInfo.Time).fromNow() : null}
          detailComponent={
            <NavWalletDetails
              walletAmount={balance}
              rewards={rewards}
              onUpdateHideBalance={this.updateHideBalance}
              shouldHideBalance={profile.shouldHideBalance}
              getTokenInfo={genLookupOrFail(this.props.stores.tokenInfoStore.tokenInfo)}
              defaultToken={this.props.stores.tokenInfoStore.getDefaultTokenInfo(wallet.getParent().getNetworkInfo().NetworkId)}
              showEyeIcon={false}
              unitOfAccountSetting={profile.unitOfAccount}
              getCurrentPrice={this.props.stores.coinPriceStore.getCurrentPrice}
              purpose="allWallets"
            />
          }
        />
      );
    });
    const dropdownContent = (
      <>
        <NavDropdownRow title={intl.formatMessage(globalMessages.allWalletsLabel)} detailComponent={undefined} />
        {walletComponents}
      </>
    );

    const dropdownComponent = (() => {
      const getDropdownHead = () => {
        const publicDeriver = walletsStore.selected;
        if (publicDeriver == null) {
          return <NoWalletsDropdown />;
        }

        const balance: ?MultiToken = this.props.stores.transactions.getBalance(publicDeriver);
        const rewards: MultiToken = this.props.stores.delegation.getRewardBalanceOrZero(publicDeriver);
        console.log('balance', balance);
        return (
          <NavWalletDetails
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
            purpose="topBar"
          />
        );
      };

      return (
        <NavDropdown
          headerComponent={getDropdownHead()}
          contentComponents={dropdownContent}
          onAddWallet={() => this.props.actions.router.goToRoute.trigger({ route: ROUTES.WALLETS.ADD })}
          openBuySellDialog={() => this.openDialogWrapper(BuySellDialog)}
        />
      );
    })();

    const getPlate = () => {
      const publicDeriver = walletsStore.selected;
      if (publicDeriver == null) return null;

      const parent = publicDeriver.getParent();

      const settingsCache = this.props.stores.walletSettings.getConceptualWalletSettingsCache(parent);

      const withPubKey = asGetPublicKey(publicDeriver);
      const plate = withPubKey == null ? null : this.props.stores.wallets.getPublicKeyCache(withPubKey).plate;

      return <NavPlate plate={plate} wallet={settingsCache} />;
    };

    return <NavBar title={this.props.title} walletPlate={getPlate()} walletDetails={dropdownComponent} />;
  }
}
