// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { intlShape, defineMessages } from 'react-intl';

import environment from '../../environment';
import { ROUTES } from '../../routes-config';
import RouterActions from '../../actions/router-actions';
import type { InjectedProps } from '../../types/injectedPropsType';

import AdaWalletsStore from '../../stores/ada/AdaWalletsStore';
import TrezorConnectStore from '../../stores/ada/TrezorConnectStore';
import LedgerConnectStore from '../../stores/ada/LedgerConnectStore';

import MainLayout from '../MainLayout';
import WalletAdd from '../../components/wallet/WalletAdd';

import WalletCreateDialogContainer from './dialogs/WalletCreateDialogContainer';
import WalletCreateDialog from '../../components/wallet/WalletCreateDialog';
import WalletBackupDialogContainer from './dialogs/WalletBackupDialogContainer';
import WalletBackupDialog from '../../components/wallet/WalletBackupDialog';

import WalletRestoreOptionsDialogContainer from './dialogs/WalletRestoreOptionsDialogContainer';
import WalletRestoreDialogContainer from './dialogs/WalletRestoreDialogContainer';
import WalletRestoreOptionsDialog from '../../components/wallet/WalletRestoreOptionsDialog';
import WalletRestoreDialog from '../../components/wallet/WalletRestoreDialog';

import WalletConnectHardwareDialogContainer from './dialogs/WalletConnectHardwareDialogContainer';
import WalletConnectHardwareDialog from '../../components/wallet/WalletConnectHardwareDialog';
import WalletTrezorConnectDialogContainer from './dialogs/WalletTrezorConnectDialogContainer';
import WalletLedgerConnectDialogContainer from './dialogs/WalletLedgerConnectDialogContainer';

type Props = InjectedProps;

const messages = defineMessages({
  title: {
    id: 'wallet.add.page.title',
    defaultMessage: '!!!Add Wallet',
  },
  subTitle: {
    id: 'wallet.add.subpage.title',
    defaultMessage: '!!!Yoroi light wallet for Cardano',
  },
});

@observer
export default class WalletAddPage extends Component<Props> {
  static contextTypes = {
    intl: intlShape.isRequired,
  };

  onClose = () => {
    if (!this.props.stores.substores[environment.API].wallets.hasAnyWallets) {
      this.props.actions.router.goToRoute.trigger({ route: ROUTES.WALLETS.ADD });
    }
    this.props.actions.dialogs.closeActiveDialog.trigger();
  };

  render() {
    const { profile } = this.props.stores;
    const wallets = this._getWalletsStore();
    const { actions, stores } = this.props;
    const { uiDialogs } = stores;
    const { restoreRequest } = wallets;

    const isCreateTrezorWalletActive = this._getTrezorConnectStore().isCreateHWActive;
    const isCreateLedgerWalletActive = this._getLedgerConnectStore().isCreateHWActive;
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
    } else if (uiDialogs.isOpen(WalletRestoreOptionsDialog)) {
      activeDialog = (
        <WalletRestoreOptionsDialogContainer
          stores={stores}
          onClose={this.onClose}
          classicTheme={profile.isClassicTheme}
          onRestore={() => actions.dialogs.open.trigger({ dialog: WalletRestoreDialog })}
          onPaperRestore={() => actions.dialogs.open.trigger({ dialog: WalletRestoreDialog, params: { restoreType: 'paper' } })}
        />
      );
    } else if (uiDialogs.isOpen(WalletRestoreDialog)) {
      const restoreType = uiDialogs.getParam('restoreType');
      activeDialog = (
        <WalletRestoreDialogContainer
          actions={actions}
          stores={stores}
          onClose={this.onClose}
          classicTheme={profile.isClassicTheme}
          mode={restoreType || 'regular'}
        />
      );
    } else if (uiDialogs.isOpen(WalletConnectHardwareDialog)) {
      activeDialog = (
        <WalletConnectHardwareDialogContainer
          actions={actions}
          stores={stores}
          onClose={this.onClose}
          classicTheme={profile.isClassicTheme}
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
          classicTheme={profile.isClassicTheme}
        />
      );
    } else if (uiDialogs.isOpen(WalletLedgerConnectDialogContainer)) {
      activeDialog = (
        <WalletLedgerConnectDialogContainer
          actions={actions}
          stores={stores}
          onClose={this.onClose}
          classicTheme={profile.isClassicTheme}
        />
      );
    }

    const content = (
      <WalletAdd
        onHardwareConnect={
          () => actions.dialogs.open.trigger({ dialog: WalletConnectHardwareDialog })
        }
        isCreateTrezorWalletActive={isCreateTrezorWalletActive}
        isCreateLedgerWalletActive={isCreateLedgerWalletActive}
        onCreate={() => actions.dialogs.open.trigger({ dialog: WalletCreateDialog })}
        onRestore={() => actions.dialogs.open.trigger({ dialog: WalletRestoreOptionsDialog })}
        onPaperRestore={() => actions.dialogs.open.trigger({ dialog: WalletRestoreDialog, params: { restoreType: 'paper' } })}
        isRestoreActive={restoreRequest.isExecuting}
        onSettings={this._goToSettingsRoot}
        onDaedalusTransfer={this._goToDaedalusTransferRoot}
        title={this.context.intl.formatMessage(messages.title)}
        subTitle={this.context.intl.formatMessage(messages.subTitle)}
        classicTheme={profile.isClassicTheme}
      />
    );

    return (
      <MainLayout
        actions={actions}
        stores={stores}
        classicTheme={profile.isClassicTheme}
      >
        {content}
        {activeDialog}
      </MainLayout>
    );
  }

  _getRouter(): RouterActions {
    return this.props.actions.router;
  }

  _getWalletsStore(): AdaWalletsStore {
    return this.props.stores.substores[environment.API].wallets;
  }

  _getTrezorConnectStore(): TrezorConnectStore {
    return this.props.stores.substores[environment.API].trezorConnect;
  }

  _getLedgerConnectStore(): LedgerConnectStore {
    return this.props.stores.substores[environment.API].ledgerConnect;
  }

  _goToSettingsRoot = (): void => {
    // Dynamically update the topbar icons
    this.props.stores.topbar.updateCategories();

    this._getRouter().goToRoute.trigger({
      route: ROUTES.SETTINGS.ROOT
    });
  }

  _goToDaedalusTransferRoot = (): void => {
    // Dynamically update the topbar icons
    this.props.stores.topbar.updateCategories();

    this._getRouter().goToRoute.trigger({
      route: ROUTES.DAEDALUS_TRANFER.ROOT
    });
  }
}
