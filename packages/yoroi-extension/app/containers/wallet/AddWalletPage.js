// @flow
import type { Node, ComponentType } from 'react';
import type { StoresAndActionsProps } from '../../types/injectedProps.types';
import type { RestoreModeType } from '../../actions/common/wallet-restore-actions';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import type { LayoutComponentMap } from '../../styles/context/layout';
import { Component, lazy } from 'react';
import { observer } from 'mobx-react';
import { intlShape } from 'react-intl';
import { ROUTES } from '../../routes-config';
import { networks } from '../../api/ada/lib/storage/database/prepackaged/networks';
import { withLayout } from '../../styles/context/layout';
import { Box } from '@mui/material';
import globalMessages from '../../i18n/global-messages';
import TopBarLayout from '../../components/layout/TopBarLayout';
import BannerContainer from '../banners/BannerContainer';
import WalletAdd from '../../components/wallet/WalletAdd';
import WalletCreateDialogContainer from './dialogs/WalletCreateDialogContainer';
import WalletCreateDialog from '../../components/wallet/WalletCreateDialog';
import WalletBackupDialogContainer from './dialogs/WalletBackupDialogContainer';
import WalletBackupDialog from '../../components/wallet/WalletBackupDialog';
import PickCurrencyDialogContainer from './dialogs/PickCurrencyDialogContainer';
import WalletRestoreOptionDialogContainer from './dialogs/WalletRestoreOptionDialogContainer';
import WalletRestoreDialogContainer from './dialogs/WalletRestoreDialogContainer';
import WalletRestoreOptionDialog from '../../components/wallet/add/option-dialog/WalletRestoreOptionDialog';
import WalletConnectHWOptionDialogContainer from './dialogs/WalletConnectHWOptionDialogContainer';
import WalletConnectHWOptionDialog from '../../components/wallet/add/option-dialog/WalletConnectHWOptionDialog';
import WalletTrezorConnectDialogContainer from './dialogs/WalletTrezorConnectDialogContainer';
import WalletLedgerConnectDialogContainer from './dialogs/WalletLedgerConnectDialogContainer';
import SidebarContainer from '../SidebarContainer';
import NavBar from '../../components/topbar/NavBar';
import NavBarTitle from '../../components/topbar/NavBarTitle';
import AddWalletPageRevamp from './AddWalletPageRevamp';

export const AddAnotherWalletPromise: void => Promise<any> = () =>
  import('../../components/wallet/add/AddAnotherWallet');
const AddAnotherWallet = lazy(AddAnotherWalletPromise);

type Props = StoresAndActionsProps;
type InjectedLayoutProps = {| +renderLayoutComponent: LayoutComponentMap => Node |};
type AllProps = {| ...Props, ...InjectedLayoutProps |};

@observer
class AddWalletPage extends Component<AllProps> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  onClose: void => void = () => {
    if (!this.props.stores.wallets.hasAnyWallets) {
      this.props.actions.router.goToRoute.trigger({ route: ROUTES.WALLETS.ADD });
    }
    this.props.actions.dialogs.closeActiveDialog.trigger();
  };

  openDialogWrapper: any => void = dialog => {
    // we reset the API when we open a dialog instead of when we close a dialog
    // this is because on close, asynchronous unmount actions get triggered
    // so there is no safe time at which we can un-select the API
    // so instead, the API gets reset before we start any dialog flow
    this.props.actions.profile.setSelectedNetwork.trigger(undefined);

    this.props.actions.dialogs.open.trigger({ dialog });
  };

  componentDidMount() {
    const { isRevampTheme } = this.props.stores.profile;
    if (!isRevampTheme) this.props.actions.wallets.unselectWallet.trigger();
  }

  render(): Node {
    const { selectedNetwork } = this.props.stores.profile;
    const { actions, stores } = this.props;
    const { uiDialogs } = stores;

    const openTrezorConnectDialog = () => {
      if (selectedNetwork === undefined) {
        throw new Error(`${nameof(AddWalletPage)} no API selected`);
      }
      actions.dialogs.push.trigger({
        dialog: WalletTrezorConnectDialogContainer,
      });
      // <TODO:HW_REFACTOR>
      stores.substores.ada.trezorConnect.init();
    };
    const openLedgerConnectDialog = () => {
      if (selectedNetwork === undefined) {
        throw new Error(`${nameof(AddWalletPage)} no API selected`);
      }
      actions.dialogs.push.trigger({
        dialog: WalletLedgerConnectDialogContainer,
      });
      // <TODO:HW_REFACTOR>
      stores.substores.ada.ledgerConnect.init();
    };

    let activeDialog = null;
    if (uiDialogs.hasOpen && selectedNetwork == null) {
      activeDialog = (
        <PickCurrencyDialogContainer
          onClose={this.onClose}
          onCardano={() => actions.profile.setSelectedNetwork.trigger(networks.CardanoMainnet)}
          onCardanoPreprodTestnet={() =>
            actions.profile.setSelectedNetwork.trigger(networks.CardanoPreprodTestnet)
          }
          onCardanoPreviewTestnet={() =>
            actions.profile.setSelectedNetwork.trigger(networks.CardanoPreviewTestnet)
          }
          onCardanoSanchoTestnet={() =>
            actions.profile.setSelectedNetwork.trigger(networks.CardanoSanchoTestnet)
          }
        />
      );
    } else if (uiDialogs.isOpen(WalletCreateDialog)) {
      activeDialog = (
        <WalletCreateDialogContainer
          actions={actions}
          stores={stores}
          onClose={this.onClose}
        />
      );
    } else if (uiDialogs.isOpen(WalletBackupDialog)) {
      activeDialog = (
        <WalletBackupDialogContainer
          actions={actions}
          stores={stores}
          onClose={this.onClose}
        />
      );
    } else if (uiDialogs.isOpen(WalletRestoreOptionDialog)) {
      if (selectedNetwork === undefined) {
        throw new Error(`${nameof(AddWalletPage)} no API selected`);
      }
      activeDialog = (
        <WalletRestoreOptionDialogContainer
          onClose={this.onClose}
          onRestore15={() => {
            return actions.dialogs.push.trigger({
              dialog: WalletRestoreDialogContainer,
              params: { restoreType: { type: 'cip1852', extra: undefined, length: 15 } },
            });
          }}
          onRestore24={() => {
            actions.dialogs.push.trigger({
              dialog: WalletRestoreDialogContainer,
              params: { restoreType: { type: 'cip1852', extra: undefined, length: 24 } },
            });
          }}
        />
      );
    } else if (uiDialogs.isOpen(WalletRestoreDialogContainer)) {
      const mode = uiDialogs.getParam<RestoreModeType>('restoreType');
      if (mode == null)
        throw new Error(`${nameof(AddWalletPage)} no mode for restoration selected`);
      activeDialog = (
        <WalletRestoreDialogContainer
          actions={actions}
          stores={stores}
          onClose={this.onClose}
          onBack={() => actions.dialogs.pop.trigger()}
          mode={mode}
        />
      );
    } else if (uiDialogs.isOpen(WalletConnectHWOptionDialog)) {
      activeDialog = (
        <WalletConnectHWOptionDialogContainer
          onClose={this.onClose}
          onTrezor={() => openTrezorConnectDialog()}
          onLedger={() => openLedgerConnectDialog()}
        />
      );
    } else if (uiDialogs.isOpen(WalletTrezorConnectDialogContainer)) {
      activeDialog = (
        <WalletTrezorConnectDialogContainer
          actions={actions}
          stores={stores}
          onClose={this.onClose}
          onBack={() => actions.dialogs.pop.trigger()}
        />
      );
    } else if (uiDialogs.isOpen(WalletLedgerConnectDialogContainer)) {
      activeDialog = (
        <WalletLedgerConnectDialogContainer
          actions={actions}
          stores={stores}
          onClose={this.onClose}
          onBack={() => actions.dialogs.pop.trigger()}
        />
      );
    }

    let addWalletPageClassic = (
      <TopBarLayout
        banner={<BannerContainer actions={actions} stores={stores} />}
        sidebar={<SidebarContainer actions={actions} stores={stores} />}
        navbar={
          <NavBar
            title={
              <NavBarTitle title={this.context.intl.formatMessage(globalMessages.addWalletLabel)} />
            }
          />
        }
        showInContainer
      >
        <AddAnotherWallet
          onHardwareConnect={() => this.openDialogWrapper(WalletConnectHWOptionDialog)}
          onCreate={() => this.openDialogWrapper(WalletCreateDialog)}
          onRestore={() => this.openDialogWrapper(WalletRestoreOptionDialog)}
        />
        {activeDialog}
      </TopBarLayout>
    );

    const { hasAnyWallets } = this.props.stores.wallets;
    if (!hasAnyWallets) {
      addWalletPageClassic = (
        <TopBarLayout
          banner={<BannerContainer actions={actions} stores={stores} />}
          asModern
        >
          <WalletAdd
            onHardwareConnect={() => this.openDialogWrapper(WalletConnectHWOptionDialog)}
            onCreate={() => this.openDialogWrapper(WalletCreateDialog)}
            onRestore={() => this.openDialogWrapper(WalletRestoreOptionDialog)}
            onSettings={this._goToSettingsRoot}
          />
          {activeDialog}
        </TopBarLayout>
      );
    }

    const goToRoute = this.props.actions.router.goToRoute;
    const addWalletPageComponent = (
      <>
        <AddWalletPageRevamp
          onHardwareConnect={() => this.openDialogWrapper(WalletConnectHWOptionDialog)}
          onCreate={() => goToRoute.trigger({ route: ROUTES.WALLETS.CREATE_NEW_WALLET })}
          onRestore={() => goToRoute.trigger({ route: ROUTES.WALLETS.RESTORE_WALLET })}
          goToCurrentWallet={() => goToRoute.trigger({ route: ROUTES.WALLETS.TRANSACTIONS })}
          hasAnyWallets={hasAnyWallets === true}
        />
        {activeDialog}
      </>
    );

    const addWalletPageRevamp = !hasAnyWallets ? (
      <Box py="48px" height="100vh" sx={{ overflowY: 'auto' }}>
        {addWalletPageComponent}
      </Box>
    ) : (
      <TopBarLayout
        banner={<BannerContainer actions={actions} stores={stores} />}
        sidebar={<SidebarContainer actions={actions} stores={stores} />}
      >
        {addWalletPageComponent}
      </TopBarLayout>
    );

    return this.props.renderLayoutComponent({
      CLASSIC: addWalletPageClassic,
      REVAMP: addWalletPageRevamp,
    });
  }

  _goToSettingsRoot: () => void = () => {
    this.props.actions.router.goToRoute.trigger({
      route: ROUTES.SETTINGS.ROOT,
    });
  };
}
export default (withLayout(AddWalletPage): ComponentType<Props>);
