// @flow
import type { Node } from 'react';
import { Component } from 'react';
import { observer } from 'mobx-react';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { intlShape } from 'react-intl';
import TopBarLayout from '../../components/layout/TopBarLayout';
import VerticallyCenteredLayout from '../../components/layout/VerticallyCenteredLayout';
import SidebarContainer from '../SidebarContainer';
import NavBarContainer from '../NavBarContainer';
import BannerContainer from '../banners/BannerContainer';
import LoadingSpinner from '../../components/widgets/LoadingSpinner';
import { ROUTES } from '../../routes-config';
import type { StoresAndActionsProps } from '../../types/injectedProps.types';
import { allSubcategoriesRevamp } from '../../stores/stateless/topbarCategories';
import NavBarContainerRevamp from '../NavBarContainerRevamp';
import globalMessages from '../../i18n/global-messages';
import NavBarTitle from '../../components/topbar/NavBarTitle';
import SubMenu from '../../components/topbar/SubMenu';
import WalletLoadingAnimation from '../../components/wallet/WalletLoadingAnimation';
import { RevampAnnouncementDialog } from './dialogs/RevampAnnouncementDialog';
import { PoolTransitionDialog } from './dialogs/pool-transition/PoolTransitionDialog';
import { Redirect } from 'react-router';

type Props = {|
  +children: Node,
|};
@observer
export default class Wallet extends Component<{| ...Props, ...StoresAndActionsProps |}> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  componentDidMount() {
    if (!this.props.stores.profile.isRevampAnnounced)
      this.props.actions.dialogs.open.trigger({ dialog: RevampAnnouncementDialog });
  }

  checkRoute(): void | string {
    const categories = allSubcategoriesRevamp;
    if (this.props.stores.app.currentRoute.startsWith(ROUTES.TRANSFER.ROOT)) {
      return ROUTES.WALLETS.TRANSACTIONS;
    }

    // void -> this route is fine for this wallet type
    // string -> what you should be redirected to
    const wallet = this.props.stores.wallets.selected;
    if (wallet == null) return;

    const spendableBalance = this.props.stores.transactions.balance;
    const walletHasAssets = !!spendableBalance?.nonDefaultEntries().length;

    const activeCategory = categories.find(category =>
      this.props.stores.app.currentRoute.startsWith(category.route)
    );

    // if we're on a page that isn't applicable for the currently selected wallet
    // ex: a cardano-only page for an Ergo wallet
    // or no category is selected yet (wallet selected for the first time)
    const visibilityContext = {
      selected: wallet.publicDeriverId,
      networkId: wallet.networkId,
      walletHasAssets
    };
    if (
      !activeCategory?.isVisible(visibilityContext) &&
      activeCategory?.isHiddenButAllowed !== true
    ) {
      const firstValidCategory = categories.find(c => c.isVisible(visibilityContext));
      if (firstValidCategory == null) {
        throw new Error(`Selected wallet has no valid category`);
      }
      return firstValidCategory.route;
    }
  }

  navigateToMyWallets: string => void = destination => {
    this.props.actions.router.goToRoute.trigger({ route: destination });
  };

  render(): Node {
    const { actions, stores } = this.props;
    // abort rendering if the page isn't valid for this wallet
    const newRoute = this.checkRoute();
    if (newRoute != null) {
      return <Redirect to={newRoute} />;
    }
    const { intl } = this.context;
    const selectedWallet = stores.wallets.selectedOrFail;

    if (!selectedWallet) {
      return (
        <TopBarLayout
          banner={<BannerContainer actions={actions} stores={stores} />}
          navbar={<NavBarContainer title="" actions={actions} stores={stores} />}
          showInContainer
          showAsCard
        >
          <VerticallyCenteredLayout>
            <LoadingSpinner />
          </VerticallyCenteredLayout>
        </TopBarLayout>
      );
    }
    const warning = this.getWarning(selectedWallet.publicDeriverId);

    const isInitialSyncing = stores.wallets.isInitialSyncing(selectedWallet.publicDeriverId);
    const spendableBalance = stores.transactions.balance;
    const walletHasAssets = !!(spendableBalance?.nonDefaultEntries().length);

    const publicDeriver = this.props.stores.wallets.selected;
    if (publicDeriver == null) {
      throw new Error(`${nameof(Wallet)} no public deriver. Should never happen`);
    }
    const currentPool = this.props.stores.delegation.getDelegatedPoolId(publicDeriver.publicDeriverId);

    const visibilityContext = {
      selected: selectedWallet.publicDeriverId,
      networkId: selectedWallet.networkId,
      walletHasAssets
    };

    const menu = (
      <SubMenu
        options={allSubcategoriesRevamp
          .filter(category => category.isVisible(visibilityContext))
          .map(category => ({
            className: category.className,
            label: intl.formatMessage(category.label),
            route: category.route,
          }))}
        onItemClick={route => actions.router.goToRoute.trigger({ route })}
        isActiveItem={route => this.props.stores.app.currentRoute.startsWith(route)}
        locationId="wallet"
      />
    );

    const sidebarContainer = <SidebarContainer actions={actions} stores={stores} />;

    return (
      <TopBarLayout
        banner={<BannerContainer actions={actions} stores={stores}/>}
        sidebar={sidebarContainer}
        navbar={
          <NavBarContainerRevamp
            actions={actions}
            stores={stores}
            title={<NavBarTitle title={intl.formatMessage(globalMessages.walletLabel)}/>}
            menu={isInitialSyncing ? null : menu}
          />
        }
        showInContainer
        showAsCard
      >
        {warning}
        {isInitialSyncing ? (
          <WalletLoadingAnimation/>
        ) : (
          <>
            {this.props.children}
            {this.getDialogs(intl, currentPool)}
          </>
        )}
      </TopBarLayout>
    );
  }

  getWarning: (number) => void | Node = publicDeriverId => {
    const warnings = this.props.stores.walletSettings.getWalletWarnings(publicDeriverId).dialogs;
    if (warnings.length === 0) {
      return undefined;
    }
    return warnings[warnings.length - 1]();
  };

  getDialogs: (any, any) => Node = (intl, currentPool) => {
    const isOpen = this.props.stores.uiDialogs.isOpen;
    const isRevampDialogOpen = isOpen(RevampAnnouncementDialog);
    const selectedWallet = this.props.stores.wallets.selected;
    const poolTransitionInfo = this.props.stores.delegation.getPoolTransitionInfo(selectedWallet);


    if (
      this.props.stores.delegation.getPoolTransitionConfig(selectedWallet).show === 'open' &&
      !isRevampDialogOpen &&
      poolTransitionInfo?.shouldShowTransitionFunnel
    )
      return (
        <PoolTransitionDialog
          intl={intl}
          onClose={() => {
            this.props.stores.delegation.setPoolTransitionConfig(selectedWallet, { show: 'idle' });
          }}
          poolTransition={poolTransitionInfo}
          currentPoolId={currentPool ?? ''}
          onUpdatePool={() => {
            this.props.stores.delegation.setPoolTransitionConfig(selectedWallet, {
              show: 'idle',
              shouldUpdatePool: true,
            });
            this.props.actions.router.goToRoute.trigger({
              route: ROUTES.STAKING,
            });
          }}
        />
      );

    if (isRevampDialogOpen)
      return (
        <RevampAnnouncementDialog
          onClose={() => {
            this.props.actions.profile.markRevampAsAnnounced.trigger();
            this.props.actions.dialogs.closeActiveDialog.trigger();
          }}
        />
      );

    return null;
  };
}
