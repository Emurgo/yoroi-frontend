// @flow
import type { Node } from 'react';
import { Component } from 'react';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { IntlContext } from 'react-intl';
import { observer } from 'mobx-react';
import { ROUTES } from '../../routes-config';
import { Box } from '@mui/material';
import TopBarLayout from '../../components/layout/TopBarLayout';
import BannerContainer from '../banners/BannerContainer';
import WalletCreateDialogContainer from './dialogs/WalletCreateDialogContainer';
import WalletCreateDialog from '../../components/wallet/WalletCreateDialog';
import WalletBackupDialogContainer from './dialogs/WalletBackupDialogContainer';
import WalletBackupDialog from '../../components/wallet/WalletBackupDialog';
import WalletRestoreOptionDialogContainer from './dialogs/WalletRestoreOptionDialogContainer';
import WalletRestoreDialogContainer from './dialogs/WalletRestoreDialogContainer';
import WalletRestoreOptionDialog from '../../components/wallet/add/option-dialog/WalletRestoreOptionDialog';
import WalletConnectHWOptionDialogContainer from './dialogs/WalletConnectHWOptionDialogContainer';
import WalletConnectHWOptionDialog from '../../components/wallet/add/option-dialog/WalletConnectHWOptionDialog';
import WalletTrezorConnectDialogContainer from './dialogs/WalletTrezorConnectDialogContainer';
import WalletLedgerConnectDialogContainer from './dialogs/WalletLedgerConnectDialogContainer';
import SidebarContainer from '../SidebarContainer';
import AddWalletPageRevamp from './AddWalletPageRevamp';
import type { RestoreModeType } from '../../stores/toplevel/WalletRestoreStore';
import type { StoresProps } from '../../stores';
import { ampli } from '../../../ampli/index';

@observer
export default class AddWalletPage extends Component<StoresProps> {
  static contextType = IntlContext;
  onClose: void => void = () => {
    if (!this.props.stores.wallets.hasAnyWallets) {
      this.props.stores.routing.goToRoute({ route: ROUTES.WALLETS.ADD });
    }
    this.props.stores.uiDialogs.closeActiveDialog();
  };

  openDialogWrapper: any => void = dialog => {
    this.props.stores.uiDialogs.open({ dialog });
  };

  render(): Node {
    const { stores } = this.props;
    const { selectedNetwork } = stores.profile;
    const { uiDialogs } = stores;

    const openTrezorConnectDialog = () => {
      if (selectedNetwork === undefined) {
        throw new Error(`${nameof(AddWalletPage)} no API selected`);
      }
      stores.uiDialogs.push({
        dialog: WalletTrezorConnectDialogContainer,
      });
      // <TODO:HW_REFACTOR>
      stores.substores.ada.trezorConnect.init();
      ampli.connectWalletCheckPageViewed();
    };
    const openLedgerConnectDialog = () => {
      if (selectedNetwork === undefined) {
        throw new Error(`${nameof(AddWalletPage)} no API selected`);
      }
      stores.uiDialogs.push({
        dialog: WalletLedgerConnectDialogContainer,
      });
      // <TODO:HW_REFACTOR>
      stores.substores.ada.ledgerConnect.init();
      ampli.connectWalletCheckPageViewed();
    };

    let activeDialog = null;
    if (uiDialogs.isOpen(WalletCreateDialog)) {
      activeDialog = (
        <WalletCreateDialogContainer
          stores={stores}
          onClose={this.onClose}
        />
      );
    } else if (uiDialogs.isOpen(WalletBackupDialog)) {
      activeDialog = (
        <WalletBackupDialogContainer
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
            return stores.uiDialogs.push({
              dialog: WalletRestoreDialogContainer,
              params: { restoreType: { type: 'cip1852', extra: undefined, length: 15 } },
            });
          }}
          onRestore24={() => {
            stores.uiDialogs.push({
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
          stores={stores}
          onClose={this.onClose}
          onBack={() => stores.uiDialogs.pop()}
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
          stores={stores}
          onClose={this.onClose}
          onBack={() => stores.uiDialogs.pop()}
        />
      );
    } else if (uiDialogs.isOpen(WalletLedgerConnectDialogContainer)) {
      activeDialog = (
        <WalletLedgerConnectDialogContainer
          stores={stores}
          onClose={this.onClose}
          onBack={() => stores.uiDialogs.pop()}
        />
      );
    }

    const { hasAnyWallets } = this.props.stores.wallets;
    const goToRoute = stores.routing.goToRoute;
    const addWalletPageComponent = (
      <>
        <AddWalletPageRevamp
          onHardwareConnect={() => {
            this.openDialogWrapper(WalletConnectHWOptionDialog);
          }}
          onCreate={() => goToRoute({ route: ROUTES.WALLETS.CREATE_NEW_WALLET })}
          onRestore={() => goToRoute({ route: ROUTES.WALLETS.RESTORE_WALLET })}
          goToCurrentWallet={() => goToRoute({ route: ROUTES.WALLETS.TRANSACTIONS })}
          hasAnyWallets={hasAnyWallets === true}
        />
        {activeDialog}
      </>
    );

    return !hasAnyWallets ? (
      <Box py="48px" height="100vh" sx={{ overflowY: 'auto' }}>
        {addWalletPageComponent}
      </Box>
    ) : (
      <TopBarLayout
        banner={<BannerContainer stores={stores}/>}
        sidebar={<SidebarContainer stores={stores}/>}
      >
        {addWalletPageComponent}
      </TopBarLayout>
    );
  }

  _goToSettingsRoot: () => void = () => {
    this.props.stores.routing.goToRoute({
      route: ROUTES.SETTINGS.ROOT,
    });
  };
}
