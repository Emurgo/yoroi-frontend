// @flow
import type { Node, ComponentType } from 'react';
import { Component } from 'react';
import { observer } from 'mobx-react';
import { IntlContext } from 'react-intl';
import TopBarLayout from '../../components/layout/TopBarLayout';
import SidebarContainer from '../SidebarContainer';
import BannerContainer from '../banners/BannerContainer';
import { ROUTES } from '../../routes-config';
import { allSubcategoriesRevamp } from '../../stores/stateless/topbarCategories';
import NavBarContainerRevamp from '../NavBarContainerRevamp';
import globalMessages from '../../i18n/global-messages';
import NavBarTitle from '../../components/topbar/NavBarTitle';
import SubMenu from '../../components/topbar/SubMenu';
import WalletLoadingAnimation from '../../components/wallet/WalletLoadingAnimation';
import { TOP_RECENT_ANNOUNCEMENT_VERSION, RevampAnnouncementDialog } from './dialogs/RevampAnnouncementDialog';
import { PoolTransitionDialog } from './dialogs/pool-transition/PoolTransitionDialog';
import type { StoresProps } from '../../stores';
import semver from 'semver/preload';

// $FlowIgnore: suppressing this error
import { ReviewTxProvider } from '../../UI/features/transaction-review/module/ReviewTxProvider';
// $FlowIgnore: suppressing this error
import { ReviewTxModal } from '../../UI/features/transaction-review/useCases/ReviewTx';
// $FlowIgnore: suppressing this error
import { CurrencyProvider } from '../../UI/context/CurrencyContext';
// $FlowIgnore: suppressing this error
import { ModalProvider } from '../../UI/components/modals/ModalContext';
// $FlowIgnore: suppressing this error
import { ModalManager } from '../../UI/components/modals/ModalManager';
// $FlowIgnore: suppressing this error
import { MidnightDialog } from '../../UI/components/Dialogs/MidnightDialog';
// $FlowIgnore: suppressing this error
import { useYoroiRemoteConfig } from '../../UI/common/hooks/useYoroiRemoteConfig';
// $FlowIgnore: suppressing this error
import { withYoroiRemoteConfig } from '../../UI/common/helpers/withYoroiRemoteConfig';

type Props = {|
  +children: Node,
  +yoroiRemoteConfigQuery: ReturnType<typeof useYoroiRemoteConfig>,
|};

@observer
class Wallet extends Component<{| ...Props, ...StoresProps |}> {
  static contextType: any = IntlContext;
  async componentDidMount() {
    const lastAnnouncedVersion = this.props.stores.profile.lastAnnouncedFeatureVersion;
    if (lastAnnouncedVersion == null) {
      return;
    }
    if (lastAnnouncedVersion === '' || semver.lt(lastAnnouncedVersion, TOP_RECENT_ANNOUNCEMENT_VERSION)) {
      this.props.stores.uiDialogs.open({ dialog: RevampAnnouncementDialog });
    }

    const wallet = this.props.stores.wallets.selected;
    if (wallet == null) {
      throw new Error(`no public deriver. Should never happen`);
    }
    this.props.stores.delegation
      .checkGovernanceStatus(wallet)
      .then(() => {
        return null;
      })
      .catch(e => {
        console.error('Failed to fetch governance status', e);
      });
  }

  navigateToMyWallets: string => void = destination => {
    this.props.stores.routing.goToRoute({ route: destination });
  };

  render(): Node {
    const { stores } = this.props;
    const intl = this.context;
    const selectedWallet = stores.wallets.selectedOrFail;
    const warning = this.getWarning(selectedWallet.publicDeriverId);
    const isInitialSyncing = selectedWallet.lastSyncInfo.Time == null;
    const spendableBalance = stores.transactions.balance;
    const walletHasAssets = !!spendableBalance?.nonDefaultEntries().length;

    const publicDeriver = stores.wallets.selected;
    if (publicDeriver == null) {
      throw new Error(`${nameof(Wallet)} no public deriver. Should never happen`);
    }
    const currentPool = stores.delegation.getDelegatedPoolId(publicDeriver.publicDeriverId);

    const visibilityContext = {
      selected: selectedWallet.publicDeriverId,
      networkId: selectedWallet.networkId,
      walletHasAssets,
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
        onItemClick={route => stores.routing.goToRoute({ route })}
        isActiveItem={route => stores.routing.currentRoute.startsWith(route)}
        locationId="wallet"
      />
    );

    const sidebarContainer = <SidebarContainer stores={stores} />;

    return (
      <TopBarLayout
        banner={<BannerContainer stores={stores} />}
        sidebar={sidebarContainer}
        navbar={
          <NavBarContainerRevamp
            stores={stores}
            title={<NavBarTitle title={intl.formatMessage(globalMessages.walletLabel)} />}
            menu={isInitialSyncing ? null : menu}
          />
        }
        showInContainer
      >
        {warning}
        {isInitialSyncing ? (
          <WalletLoadingAnimation />
        ) : (
          <>
            <CurrencyProvider currency={this.props.stores.profile.unitOfAccount.currency || 'USD'}>
              <ModalProvider>
                <ModalManager />
                <ReviewTxProvider stores={stores} intl={this.context}>
                  <ReviewTxModal />
                  {this.props.children}
                  {this.getDialogs(intl, currentPool)}
                  <MidnightDialog />
                </ReviewTxProvider>
              </ModalProvider>
            </CurrencyProvider>
          </>
        )}
      </TopBarLayout>
    );
  }

  getWarning: number => void | Node = publicDeriverId => {
    const warnings = this.props.stores.walletSettings.getWalletWarnings(publicDeriverId).dialogs;
    if (warnings.length === 0) {
      return undefined;
    }
    return warnings[warnings.length - 1]();
  };

  getDialogs: (any, any) => Node = (intl, currentPool) => {
    const { stores } = this.props;
    const isOpen = stores.uiDialogs.isOpen;
    const { data } = this.props.yoroiRemoteConfigQuery;

    const isRevampDialogOpen = isOpen(RevampAnnouncementDialog);
    const selectedWallet = stores.wallets.selected;
    const poolTransitionInfo = stores.delegation.getPoolTransitionInfo(selectedWallet);

    if (
      stores.delegation.getPoolTransitionConfig(selectedWallet).show === 'open' &&
      !isRevampDialogOpen &&
      poolTransitionInfo?.shouldShowTransitionFunnel &&
      data?.popups.poolTransitionDialog.display === true
    )
      return (
        <PoolTransitionDialog
          onClose={() => {
            stores.delegation.setPoolTransitionConfig(selectedWallet, { show: 'idle' });
          }}
          poolTransition={poolTransitionInfo}
          currentPoolId={currentPool ?? ''}
          onUpdatePool={() => {
            stores.delegation.setPoolTransitionConfig(selectedWallet, {
              show: 'idle',
              shouldUpdatePool: true,
            });
            stores.routing.goToRoute({
              route: ROUTES.STAKING,
            });
          }}
        />
      );

    if (isRevampDialogOpen && data?.popups?.generalFeaturesAnnouncement?.display === true)
      return (
        <RevampAnnouncementDialog
          // $FlowIgnore[incompatible-type]
          lastAnnouncedFeatureVersion={stores.profile.lastAnnouncedFeatureVersion ?? ''}
          // $FlowIgnore[incompatible-type]
          onClose={async () => {
            await stores.profile.setLastAnnouncedFeatureVersion(TOP_RECENT_ANNOUNCEMENT_VERSION);
            this.props.stores.uiDialogs.closeActiveDialog();
          }}
        />
      );

    return null;
  };
}

export default (withYoroiRemoteConfig(Wallet): ComponentType<Props>);
