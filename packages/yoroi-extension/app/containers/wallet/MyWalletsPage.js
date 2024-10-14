// @flow
import type { Node } from 'react';
import { Component } from 'react';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { intlShape } from 'react-intl';
import type { StoresAndActionsProps } from '../../types/injectedProps.types';
import { observer } from 'mobx-react';
import { ROUTES } from '../../routes-config';
import { genLookupOrFail, getTokenName } from '../../stores/stateless/tokenHelpers';
import { Box } from '@mui/system';
import MyWallets from '../../components/wallet/my-wallets/MyWallets';
import TopBarLayout from '../../components/layout/TopBarLayout';
import WalletRow from '../../components/wallet/my-wallets/WalletRow';
import WalletDetails from '../../components/wallet/my-wallets/WalletDetails';
import WalletCurrency from '../../components/wallet/my-wallets/WalletCurrency';
import WalletSubRow from '../../components/wallet/my-wallets/WalletSubRow';
import NavPlate from '../../components/topbar/NavPlate';
import SidebarContainer from '../SidebarContainer';
import BannerContainer from '../banners/BannerContainer';
import NavBarTitle from '../../components/topbar/NavBarTitle';
import WalletSync from '../../components/wallet/my-wallets/WalletSync';
import moment from 'moment';
import globalMessages from '../../i18n/global-messages';
import NavBarRevamp from '../../components/topbar/NavBarRevamp';
import { MultiToken } from '../../api/common/lib/MultiToken';
import type { WalletState } from '../../../chrome/extension/background/types';

@observer
export default class MyWalletsPage extends Component<StoresAndActionsProps> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  onClose: void => void = () => {
    this.props.actions.dialogs.closeActiveDialog.trigger();
  };

  openDialogWrapper: any => void = dialog => {
    this.props.stores.uiDialogs.open({ dialog });
  };

  updateHideBalance: void => Promise<void> = async () => {
    await this.props.stores.profile.updateHideBalance();
  };

  handleWalletNavItemClick: number => void = (
    publicDeriverId
  ) => {
    this.props.stores.app.goToRoute({
      route: ROUTES.WALLETS.ROOT,
      publicDeriverId,
    });
  };

  openToSettings: (number) => void = publicDeriverId => {
    this.props.stores.wallets.setActiveWallet({
      publicDeriverId
    });
    this.props.stores.app.goToRoute({
      route: ROUTES.SETTINGS.WALLET,
    });
  };

  render(): Node {
    const { intl } = this.context;
    const { actions, stores } = this.props;

    const sidebarContainer = <SidebarContainer actions={actions} stores={stores} />;
    const { wallets } = stores.wallets;
    const navbarTitle = <NavBarTitle title={intl.formatMessage(globalMessages.sidebarWallets)} />;

    const navbarElementRevamp = (
      <NavBarRevamp
        title={navbarTitle}
        buyButton={
          <>
            {/* <Button variant="secondary">{intl.formatMessage(globalMessages.send)}</Button>
            <Button variant="secondary">{intl.formatMessage(globalMessages.receive)}</Button> */}
          </>
        }
      />
    );

    const walletsList = <Box flex={1}>{wallets.map(wallet => this.generateRow(wallet))}</Box>;

    return (
      <TopBarLayout
        banner={<BannerContainer actions={actions} stores={stores} />}
        sidebar={sidebarContainer}
        navbar={navbarElementRevamp}
        showInContainer
      >
        <MyWallets>{walletsList}</MyWallets>
      </TopBarLayout>
    );
  }

  generateRow: (WalletState) => Node = wallet => {
    const walletSumCurrencies = (() => {
      const defaultToken = this.props.stores.tokenInfoStore.getDefaultTokenInfo(
        wallet.networkId
      );
      const defaultTokenInfo = genLookupOrFail(this.props.stores.tokenInfoStore.tokenInfo)({
        identifier: defaultToken.Identifier,
        networkId: wallet.networkId,
      });
      return (
        <>
          <WalletCurrency
            currency={getTokenName(defaultTokenInfo)}
            tooltipText={undefined /* TODO */}
          />
        </>
      );
    })();

    const rewards: MultiToken = this.props.stores.delegation.getRewardBalanceOrZero(
      wallet
    );

    const { plate, lastSyncInfo } = wallet;

    const isLoading = this.props.stores.transactions.isWalletLoading(wallet.publicDeriverId);

    return (
      <WalletRow
        isExpandable={false /* TODO: should be expandable if > 1 public deriver */}
        key={wallet.publicDeriverId}
        onRowClicked={() => this.handleWalletNavItemClick(wallet.publicDeriverId)}
        walletSumDetails={
          <WalletDetails
            walletAmount={wallet.balance}
            rewards={rewards}
            // TODO: This should be probably bound to an individual wallet
            onUpdateHideBalance={this.updateHideBalance}
            shouldHideBalance={this.props.stores.profile.shouldHideBalance}
            getTokenInfo={genLookupOrFail(this.props.stores.tokenInfoStore.tokenInfo)}
            isRefreshing={wallet.isRefreshing}
          />
        }
        walletSumCurrencies={walletSumCurrencies}
        walletSubRow={() => this.createSubrow(wallet)}
        walletPlate={<NavPlate plate={plate} walletType={wallet.type} name={wallet.name}/>}
        walletSync={
          <WalletSync
            time={lastSyncInfo.Time ? moment(lastSyncInfo.Time).fromNow() : null}
            isRefreshing={wallet.isRefreshing}
            isLoading={isLoading}
          />
        }
        onSettings={() => this.openToSettings(wallet.publicDeriverId)}
      />
    );
  };

  createSubrow: (WalletState) => Node = wallet => {
    const { intl } = this.context;

    const defaultToken = this.props.stores.tokenInfoStore.getDefaultTokenInfo(
      wallet.networkId,
    );
    const defaultTokenInfo = genLookupOrFail(this.props.stores.tokenInfoStore.tokenInfo)({
      identifier: defaultToken.Identifier,
      networkId: wallet.networkId,
    });

    // TODO: replace with wallet addresses
    const walletAddresses = [
      'Ae45dPwUPEZMen5UdmKCeiNqCooMVBpDQbmhM1dtFSFigvbvDTZdF4nbdf4u3',
      'Ae2tdPwUPEZMen5UdmKCeiNqCooMVBpDQbmhM1dtFSFigvbvDTZdF4nmt4s7',
    ];

    const addressesLength = walletAddresses.length;

    const plate = wallet.plate;

    const walletSubRow = (
      <WalletSubRow
        walletInfo={{
          conceptualWalletName: wallet.name,
          plate,
        }}
        // TODO: do we delete WalletDetails? Lots of duplication with Nav alternative
        walletDetails={
          <WalletDetails
            infoText={`${addressesLength} ${intl.formatMessage(
              addressesLength > 1 ? globalMessages.addressesLabel : globalMessages.addressLabel
            )}`}
            // TODO: This should be probably bound to an individual wallet
            onUpdateHideBalance={this.updateHideBalance}
            shouldHideBalance={this.props.stores.profile.shouldHideBalance}
            rewards={null /* TODO */}
            walletAmount={null /* TODO */}
            getTokenInfo={genLookupOrFail(this.props.stores.tokenInfoStore.tokenInfo)}
            isRefreshing={false /* not actually used */}
          />
        }
        walletNumber={1}
        walletAddresses={walletAddresses /* TODO: replace with proper hashes */}
        walletCurrencies={
          <WalletCurrency
            currency={getTokenName(defaultTokenInfo)}
            tooltipText="0.060" // TODO
          />
        }
      />
    );

    return walletSubRow;
  };
}
