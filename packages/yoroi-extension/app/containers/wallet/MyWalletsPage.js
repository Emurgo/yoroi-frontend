// @flow
import type { Node, ComponentType } from 'react';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import type { StoresAndActionsProps } from '../../types/injectedPropsType';
import type { ConceptualWalletSettingsCache } from '../../stores/toplevel/WalletSettingsStore';
import type { WalletInfo } from '../../components/buySell/BuySellDialog';
import type { LayoutComponentMap } from '../../styles/context/layout';
import { Component } from 'react';
import { observer } from 'mobx-react';
import { intlShape } from 'react-intl';
import { ROUTES } from '../../routes-config';
import { ConceptualWallet } from '../../api/ada/lib/storage/models/ConceptualWallet/index';
import { asGetPublicKey } from '../../api/ada/lib/storage/models/PublicDeriver/traits';
import { PublicDeriver } from '../../api/ada/lib/storage/models/PublicDeriver/index';
import { genLookupOrFail, getTokenName } from '../../stores/stateless/tokenHelpers';
import { getReceiveAddress } from '../../stores/stateless/addressStores';
import { addressToDisplayString } from '../../api/ada/lib/storage/bridge/utils';
import { networks } from '../../api/ada/lib/storage/database/prepackaged/networks';
import { withLayout } from '../../styles/context/layout';
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
import NavBar from '../../components/topbar/NavBar';
import NavBarTitle from '../../components/topbar/NavBarTitle';
import WalletSync from '../../components/wallet/my-wallets/WalletSync';
import moment from 'moment';
import NavBarAddButton from '../../components/topbar/NavBarAddButton';
import BuySellAdaButton from '../../components/topbar/BuySellAdaButton';
import globalMessages from '../../i18n/global-messages';
import BuySellDialog from '../../components/buySell/BuySellDialog';
import NavBarRevamp from '../../components/topbar/NavBarRevamp';
import { MultiToken } from '../../api/common/lib/MultiToken';

type Props = StoresAndActionsProps;

type InjectedLayoutProps = {| +renderLayoutComponent: LayoutComponentMap => Node |};
type AllProps = {| ...Props, ...InjectedLayoutProps |};

@observer
class MyWalletsPage extends Component<AllProps> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  onClose: void => void = () => {
    this.props.actions.dialogs.closeActiveDialog.trigger();
  };

  openDialogWrapper: any => void = dialog => {
    this.props.actions.dialogs.open.trigger({ dialog });
  };

  updateHideBalance: void => Promise<void> = async () => {
    await this.props.actions.profile.updateHideBalance.trigger();
  };

  handleWalletNavItemClick: PublicDeriver<> => void = (
    publicDeriver
  ) => {
    this.props.actions.router.goToRoute.trigger({
      route: ROUTES.WALLETS.ROOT,
      publicDeriver,
    });
  };

  openToSettings: (PublicDeriver<>) => void = publicDeriver => {
    this.props.actions.wallets.setActiveWallet.trigger({
      wallet: publicDeriver,
    });
    this.props.actions.router.goToRoute.trigger({
      route: ROUTES.SETTINGS.WALLET,
    });
  };

  render(): Node {
    const { intl } = this.context;
    const { actions, stores } = this.props;
    const { uiDialogs } = stores;

    const sidebarContainer = <SidebarContainer actions={actions} stores={stores} />;
    const wallets = this.props.stores.wallets.publicDerivers;
    const navbarTitle = <NavBarTitle title={intl.formatMessage(globalMessages.sidebarWallets)} />;
    const navbarElementClassic = (
      <NavBar
        title={navbarTitle}
        button={
          <NavBarAddButton
            onClick={() =>
              this.props.actions.router.goToRoute.trigger({ route: ROUTES.WALLETS.ADD })
            }
          />
        }
        buyButton={
          <BuySellAdaButton onBuySellClick={() => this.openDialogWrapper(BuySellDialog)} />
        }
      />
    );

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

    const navbarElement = this.props.renderLayoutComponent({
      CLASSIC: navbarElementClassic,
      REVAMP: navbarElementRevamp,
    });

    const walletsList = <Box flex={1}>{wallets.map(wallet => this.generateRow(wallet))}</Box>;

    let activeDialog = null;
    if (uiDialogs.isOpen(BuySellDialog)) {
      activeDialog = (
        <BuySellDialog
          onCancel={this.onClose}
          genWalletList={async () => {
            return await this.generateUnusedAddressesPerWallet(wallets);
          }}
        />
      );
    }

    return (
      <TopBarLayout
        banner={<BannerContainer actions={actions} stores={stores} />}
        sidebar={sidebarContainer}
        navbar={navbarElement}
        showInContainer
      >
        <MyWallets>{walletsList}</MyWallets>
        {activeDialog}
      </TopBarLayout>
    );
  }

  generateUnusedAddressesPerWallet: (Array<PublicDeriver<>>) => Promise<Array<WalletInfo>> = async (
    wallets: Array<PublicDeriver<>>
  ) => {
    const infoWallets = wallets.map(async (wallet: PublicDeriver<>) => {
      // Wallet Name
      const parent: ConceptualWallet = wallet.getParent();
      const settingsCache: ConceptualWalletSettingsCache = this.props.stores.walletSettings.getConceptualWalletSettingsCache(
        parent
      );

      // Currency Name
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

  /*
   * TODO: this should operator on conceptual wallets
   * with publicDerivers acting as sub-rows
   * but since we don't support multi-currency or multi-account yet we simplify the UI for now
   */
  generateRow: (PublicDeriver<>) => Node = publicDeriver => {
    const parent = publicDeriver.getParent();
    const settingsCache = this.props.stores.walletSettings.getConceptualWalletSettingsCache(
      parent
    );

    const walletSumCurrencies = (() => {
      const network = publicDeriver.getParent().getNetworkInfo();
      const defaultToken = this.props.stores.tokenInfoStore.getDefaultTokenInfo(
        network.NetworkId
      );
      const defaultTokenInfo = genLookupOrFail(this.props.stores.tokenInfoStore.tokenInfo)({
        identifier: defaultToken.Identifier,
        networkId: network.NetworkId,
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

    const balance: ?MultiToken = this.props.stores.transactions.getBalance(publicDeriver);
    const rewards: MultiToken = this.props.stores.delegation.getRewardBalanceOrZero(publicDeriver);

    const withPubKey = asGetPublicKey(publicDeriver);
    const plate =
      withPubKey == null ? null : this.props.stores.wallets.getPublicKeyCache(withPubKey).plate;

    const isRefreshing = this.props.stores.transactions.isWalletRefreshing(publicDeriver);

    const isLoading = this.props.stores.transactions.isWalletLoading(publicDeriver);

    const lastSyncInfo = this.props.stores.transactions.getLastSyncInfo(publicDeriver);

    return (
      <WalletRow
        isExpandable={false /* TODO: should be expandable if > 1 public deriver */}
        key={publicDeriver.getPublicDeriverId()}
        onRowClicked={() => this.handleWalletNavItemClick(publicDeriver)}
        walletSumDetails={
          <WalletDetails
            walletAmount={balance}
            rewards={rewards}
            // TODO: This should be probably bound to an individual wallet
            onUpdateHideBalance={this.updateHideBalance}
            shouldHideBalance={this.props.stores.profile.shouldHideBalance}
            getTokenInfo={genLookupOrFail(this.props.stores.tokenInfoStore.tokenInfo)}
            isRefreshing={isRefreshing}
          />
        }
        walletSumCurrencies={walletSumCurrencies}
        walletSubRow={() => this.createSubrow(publicDeriver)}
        walletPlate={<NavPlate plate={plate} wallet={settingsCache} />}
        walletSync={
          <WalletSync
            time={lastSyncInfo.Time ? moment(lastSyncInfo.Time).fromNow() : null}
            isRefreshing={isRefreshing}
            isLoading={isLoading}
          />
        }
        onSettings={() => this.openToSettings(publicDeriver)}
      />
    );
  };

  createSubrow: (PublicDeriver<>) => Node = publicDeriver => {
    const { intl } = this.context;

    const network = publicDeriver.getParent().getNetworkInfo();
    const defaultToken = this.props.stores.tokenInfoStore.getDefaultTokenInfo(
      network.NetworkId
    );
    const defaultTokenInfo = genLookupOrFail(this.props.stores.tokenInfoStore.tokenInfo)({
      identifier: defaultToken.Identifier,
      networkId: network.NetworkId,
    });

    // TODO: replace with wallet addresses
    const walletAddresses = [
      'Ae45dPwUPEZMen5UdmKCeiNqCooMVBpDQbmhM1dtFSFigvbvDTZdF4nbdf4u3',
      'Ae2tdPwUPEZMen5UdmKCeiNqCooMVBpDQbmhM1dtFSFigvbvDTZdF4nmt4s7',
    ];

    const addressesLength = walletAddresses.length;

    const parent = publicDeriver.getParent();
    const settingsCache = this.props.stores.walletSettings.getConceptualWalletSettingsCache(
      parent
    );

    const withPubKey = asGetPublicKey(publicDeriver);
    const plate =
      withPubKey == null ? null : this.props.stores.wallets.getPublicKeyCache(withPubKey).plate;

    const walletSubRow = (
      <WalletSubRow
        walletInfo={{
          conceptualWalletName: settingsCache.conceptualWalletName,
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
export default (withLayout(MyWalletsPage): ComponentType<Props>);
