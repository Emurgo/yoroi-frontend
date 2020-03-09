// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { intlShape } from 'react-intl';

import environment from '../../environment';
import { ROUTES } from '../../routes-config';
import RouterActions from '../../actions/router-actions';
import type { InjectedProps } from '../../types/injectedPropsType';
import globalMessages from '../../i18n/global-messages';

import MainLayout from '../MainLayout';
import WalletAdd from '../../components/wallet/WalletAdd';
import AddAnotherWallet from '../../components/wallet/add/AddAnotherWallet';

import WalletCreateDialogContainer from './dialogs/WalletCreateDialogContainer';
import WalletCreateDialog from '../../components/wallet/WalletCreateDialog';
import WalletBackupDialogContainer from './dialogs/WalletBackupDialogContainer';
import WalletBackupDialog from '../../components/wallet/WalletBackupDialog';

import WalletRestoreOptionDialogContainer from './dialogs/WalletRestoreOptionDialogContainer';
import WalletRestoreDialogContainer from './dialogs/WalletRestoreDialogContainer';
import WalletRestoreOptionDialog from '../../components/wallet/add/option-dialog/WalletRestoreOptionDialog';
import WalletRestoreDialog from '../../components/wallet/WalletRestoreDialog';

import WalletConnectHWOptionDialogContainer from './dialogs/WalletConnectHWOptionDialogContainer';
import WalletConnectHWOptionDialog from '../../components/wallet/add/option-dialog/WalletConnectHWOptionDialog';
import WalletTrezorConnectDialogContainer from './dialogs/WalletTrezorConnectDialogContainer';
import WalletLedgerConnectDialogContainer from './dialogs/WalletLedgerConnectDialogContainer';

import SidebarContainer from '../SidebarContainer';
import NavBar from '../../components/topbar/NavBar';
import NavBarTitle from '../../components/topbar/NavBarTitle';

import type { RestoreModeType } from '../../actions/ada/wallet-restore-actions';
import { RestoreMode } from '../../actions/ada/wallet-restore-actions';

type Props = InjectedProps;

@observer
export default class WalletAddPage extends Component<Props> {
  static contextTypes = {
    intl: intlShape.isRequired,
  };

  onClose = () => {
    if (!this.props.stores.wallets.hasAnyWallets) {
      this.props.actions.router.goToRoute.trigger({ route: ROUTES.WALLETS.ADD });
    }
    this.props.actions.dialogs.closeActiveDialog.trigger();
  };

  componentDidMount() {
    this.props.actions.wallets.unselectWallet.trigger();
  }

  render() {
    const { profile } = this.props.stores;
    const { actions, stores } = this.props;
    const { uiDialogs } = stores;
    const { checkAdaServerStatus } = stores.substores[environment.API].serverConnectionStore;

    const openTrezorConnectDialog = () => {
      actions.dialogs.open.trigger({ dialog: WalletTrezorConnectDialogContainer });
      this.props.actions[environment.API].trezorConnect.init.trigger();
    };
    const openLedgerConnectDialog = () => {
      actions.dialogs.open.trigger({ dialog: WalletLedgerConnectDialogContainer });
      this.props.actions[environment.API].ledgerConnect.init.trigger();
    };

    let activeDialog = null;
    if (uiDialogs.isOpen(WalletCreateDialog)) {
      activeDialog = (
        <WalletCreateDialogContainer
          actions={actions}
          stores={stores}
          onClose={this.onClose}
          classicTheme={profile.isClassicTheme}
        />
      );
    } else if (uiDialogs.isOpen(WalletBackupDialog)) {
      activeDialog = (
        <WalletBackupDialogContainer
          actions={actions}
          stores={stores}
          onClose={this.onClose}
          classicTheme={profile.isClassicTheme}
        />
      );
    } else if (uiDialogs.isOpen(WalletRestoreOptionDialog)) {
      activeDialog = (
        <WalletRestoreOptionDialogContainer
          onClose={this.onClose}
          onRestore={() => actions.dialogs.open.trigger({ dialog: WalletRestoreDialog })}
          onPaperRestore={() => actions.dialogs.open.trigger({
            dialog: WalletRestoreDialog,
            params: { restoreType: (RestoreMode.PAPER: RestoreModeType)  }
          })}
        />
      );
    } else if (uiDialogs.isOpen(WalletRestoreDialog)) {
      const mode = uiDialogs.getParam<?RestoreModeType>('restoreType') || RestoreMode.REGULAR;
      activeDialog = (
        <WalletRestoreDialogContainer
          actions={actions}
          stores={stores}
          onClose={this.onClose}
          onBack={() => actions.dialogs.open.trigger({ dialog: WalletRestoreOptionDialog })}
          classicTheme={profile.isClassicTheme}
          mode={mode}
        />
      );
    } else if (uiDialogs.isOpen(WalletConnectHWOptionDialog)) {
      activeDialog = (
        <WalletConnectHWOptionDialogContainer
          onClose={this.onClose}
          onTrezor={openTrezorConnectDialog}
          onLedger={openLedgerConnectDialog}
        />
      );
    } else if (uiDialogs.isOpen(WalletTrezorConnectDialogContainer)) {
      activeDialog = (
        <WalletTrezorConnectDialogContainer
          actions={actions}
          stores={stores}
          onClose={this.onClose}
          onBack={() => actions.dialogs.open.trigger({ dialog: WalletConnectHWOptionDialog })}
          classicTheme={profile.isClassicTheme}
        />
      );
    } else if (uiDialogs.isOpen(WalletLedgerConnectDialogContainer)) {
      activeDialog = (
        <WalletLedgerConnectDialogContainer
          actions={actions}
          stores={stores}
          onClose={this.onClose}
          onBack={() => actions.dialogs.open.trigger({ dialog: WalletConnectHWOptionDialog })}
          classicTheme={profile.isClassicTheme}
        />
      );
    }

    const { hasAnyWallets } = this.props.stores.wallets;
    if (!hasAnyWallets) {
      return (
        <MainLayout
          connectionErrorType={checkAdaServerStatus}
        >
          <WalletAdd
            onHardwareConnect={
              () => actions.dialogs.open.trigger({ dialog: WalletConnectHWOptionDialog })
            }
            onCreate={() => actions.dialogs.open.trigger({ dialog: WalletCreateDialog })}
            onRestore={() => actions.dialogs.open.trigger({ dialog: WalletRestoreOptionDialog })}
            onSettings={this._goToSettingsRoot}
            onDaedalusTransfer={this._goToDaedalusTransferRoot}
          />
          {activeDialog}
        </MainLayout>
      );
    }
    const navbarElement = (
      <NavBar
        title={
          <NavBarTitle
            title={this.context.intl.formatMessage(globalMessages.addWalletLabel)}
          />
        }
      />
    );
    return (
      <MainLayout
        connectionErrorType={checkAdaServerStatus}
        sidebar={<SidebarContainer actions={actions} stores={stores} />}
        navbar={navbarElement}
        showInContainer
      >
        <AddAnotherWallet
          onHardwareConnect={
            () => actions.dialogs.open.trigger({ dialog: WalletConnectHWOptionDialog })
          }
          onCreate={() => actions.dialogs.open.trigger({ dialog: WalletCreateDialog })}
          onRestore={() => actions.dialogs.open.trigger({ dialog: WalletRestoreOptionDialog })}
        />
        {activeDialog}
      </MainLayout>
    );
  }

  _getRouter(): RouterActions {
    return this.props.actions.router;
  }

  _goToSettingsRoot = (): void => {
    this._getRouter().goToRoute.trigger({
      route: ROUTES.SETTINGS.ROOT
    });
  }

  _goToDaedalusTransferRoot = (): void => {
    this._getRouter().goToRoute.trigger({
      route: ROUTES.TRANSFER.DAEDALUS
    });
  }
}
