// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { computed } from 'mobx';
import { intlShape } from 'react-intl';

import environment from '../../environment';
import { ROUTES } from '../../routes-config';
import type { InjectedOrGenerated } from '../../types/injectedPropsType';
import globalMessages from '../../i18n/global-messages';

import MainLayout from '../MainLayout';
import WalletAdd from '../../components/wallet/WalletAdd';
import AddAnotherWallet from '../../components/wallet/add/AddAnotherWallet';

import WalletCreateDialogContainer from './dialogs/WalletCreateDialogContainer';
import type { GeneratedData as WalletCreateDialogContainerData } from './dialogs/WalletCreateDialogContainer';
import WalletCreateDialog from '../../components/wallet/WalletCreateDialog';
import WalletBackupDialogContainer from './dialogs/WalletBackupDialogContainer';
import type { GeneratedData as WalletBackupDialogContainerData } from './dialogs/WalletBackupDialogContainer';
import WalletBackupDialog from '../../components/wallet/WalletBackupDialog';

import WalletRestoreOptionDialogContainer from './dialogs/WalletRestoreOptionDialogContainer';
import WalletRestoreDialogContainer from './dialogs/WalletRestoreDialogContainer';
import type { GeneratedData as WalletRestoreDialogContainerData } from './dialogs/WalletRestoreDialogContainer';
import WalletRestoreOptionDialog from '../../components/wallet/add/option-dialog/WalletRestoreOptionDialog';
import WalletRestoreDialog from '../../components/wallet/WalletRestoreDialog';

import WalletConnectHWOptionDialogContainer from './dialogs/WalletConnectHWOptionDialogContainer';
import WalletConnectHWOptionDialog from '../../components/wallet/add/option-dialog/WalletConnectHWOptionDialog';
import WalletTrezorConnectDialogContainer from './dialogs/WalletTrezorConnectDialogContainer';
import type { GeneratedData as WalletTrezorConnectDialogContainerData } from './dialogs/WalletTrezorConnectDialogContainer';
import WalletLedgerConnectDialogContainer from './dialogs/WalletLedgerConnectDialogContainer';
import type { GeneratedData as WalletLedgerConnectDialogContainerData } from './dialogs/WalletLedgerConnectDialogContainer';

import SidebarContainer from '../SidebarContainer';
import type { GeneratedData as SidebarContainerData } from '../SidebarContainer';
import NavBar from '../../components/topbar/NavBar';
import NavBarTitle from '../../components/topbar/NavBarTitle';

import type { RestoreModeType } from '../../actions/ada/wallet-restore-actions';
import { RestoreMode } from '../../actions/ada/wallet-restore-actions';

export type GeneratedData = typeof WalletAddPage.prototype.generated;

type Props = InjectedOrGenerated<GeneratedData>;

@observer
export default class WalletAddPage extends Component<Props> {
  static contextTypes = {
    intl: intlShape.isRequired,
  };

  onClose: void => void = () => {
    if (!this.generated.stores.wallets.hasAnyWallets) {
      this.generated.actions.router.goToRoute.trigger({ route: ROUTES.WALLETS.ADD });
    }
    this.generated.actions.dialogs.closeActiveDialog.trigger();
  };

  componentDidMount() {
    this.generated.actions.wallets.unselectWallet.trigger();
  }

  render() {
    const { actions, stores } = this.generated;
    const { uiDialogs } = stores;
    const { checkAdaServerStatus } = stores.substores[environment.API].serverConnectionStore;

    const openTrezorConnectDialog = () => {
      actions.dialogs.open.trigger({ dialog: WalletTrezorConnectDialogContainer });
      this.generated.actions[environment.API].trezorConnect.init.trigger();
    };
    const openLedgerConnectDialog = () => {
      actions.dialogs.open.trigger({ dialog: WalletLedgerConnectDialogContainer });
      this.generated.actions[environment.API].ledgerConnect.init.trigger();
    };

    let activeDialog = null;
    if (uiDialogs.isOpen(WalletCreateDialog)) {
      activeDialog = (
        <WalletCreateDialogContainer
          {...this.generated.WalletCreateDialogContainerProps}
          onClose={this.onClose}
        />
      );
    } else if (uiDialogs.isOpen(WalletBackupDialog)) {
      activeDialog = (
        <WalletBackupDialogContainer
          {...this.generated.WalletBackupDialogContainerProps}
          onClose={this.onClose}
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
          {...this.generated.WalletRestoreDialogContainerProps}
          onClose={this.onClose}
          onBack={() => actions.dialogs.open.trigger({ dialog: WalletRestoreOptionDialog })}
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
          {...this.generated.WalletTrezorConnectDialogContainerProps}
          onClose={this.onClose}
          onBack={() => actions.dialogs.open.trigger({ dialog: WalletConnectHWOptionDialog })}
        />
      );
    } else if (uiDialogs.isOpen(WalletLedgerConnectDialogContainer)) {
      activeDialog = (
        <WalletLedgerConnectDialogContainer
          {...this.generated.WalletLedgerConnectDialogContainerProps}
          onClose={this.onClose}
          onBack={() => actions.dialogs.open.trigger({ dialog: WalletConnectHWOptionDialog })}
        />
      );
    }

    const { hasAnyWallets } = this.generated.stores.wallets;
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
        sidebar={<SidebarContainer {...this.generated.SidebarContainerProps} />}
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

  _getRouter() {
    return this.generated.actions.router;
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

  @computed get generated() {
    if (this.props.generated !== undefined) {
      return this.props.generated;
    }
    if (this.props.stores == null || this.props.actions == null) {
      throw new Error(`${nameof(WalletAddPage)} no way to generated props`);
    }
    const { stores, actions } = this.props;
    return Object.freeze({
      stores: {
        uiDialogs: {
          isOpen: stores.uiDialogs.isOpen,
          getParam: stores.uiDialogs.getParam,
        },
        wallets: {
          hasAnyWallets: stores.wallets.hasAnyWallets,
        },
        substores: {
          ada: {
            serverConnectionStore: {
              checkAdaServerStatus: stores.substores.ada.serverConnectionStore.checkAdaServerStatus,
            },
          },
        },
      },
      actions: {
        router: {
          goToRoute: {
            trigger: actions.router.goToRoute.trigger,
          },
        },
        dialogs: {
          closeActiveDialog: {
            trigger: actions.dialogs.closeActiveDialog.trigger,
          },
          open: {
            trigger: actions.dialogs.open.trigger,
          },
        },
        wallets: {
          unselectWallet: {
            trigger: actions.wallets.unselectWallet.trigger,
          },
        },
        ada: {
          trezorConnect: {
            init: {
              trigger: actions.ada.trezorConnect.init.trigger,
            },
          },
          ledgerConnect: {
            init: {
              trigger: actions.ada.ledgerConnect.init.trigger,
            },
          },
        },
      },
      SidebarContainerProps: (
        { actions, stores, }: InjectedOrGenerated<SidebarContainerData>
      ),
      WalletCreateDialogContainerProps: (
        { actions, stores, }: InjectedOrGenerated<WalletCreateDialogContainerData>
      ),
      WalletBackupDialogContainerProps: (
        { actions, stores, }: InjectedOrGenerated<WalletBackupDialogContainerData>
      ),
      WalletRestoreDialogContainerProps: (
        { actions, stores, }: InjectedOrGenerated<WalletRestoreDialogContainerData>
      ),
      WalletTrezorConnectDialogContainerProps: (
        { actions, stores, }: InjectedOrGenerated<WalletTrezorConnectDialogContainerData>
      ),
      WalletLedgerConnectDialogContainerProps: (
        { actions, stores, }: InjectedOrGenerated<WalletLedgerConnectDialogContainerData>
      ),
    });
  }
}
