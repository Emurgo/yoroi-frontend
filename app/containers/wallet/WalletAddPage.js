// @flow
import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import WalletAdd from '../../components/wallet/WalletAdd';
import WalletAddDialog from '../../components/wallet/WalletAddDialog';
import WalletRestoreDialog from '../../components/wallet/WalletRestoreDialog';
import WalletCreateDialog from '../../components/wallet/WalletCreateDialog';
import WalletBackupDialog from '../../components/wallet/WalletBackupDialog';
import WalletRestoreDialogContainer from '../wallet/dialogs/WalletRestoreDialogContainer';
import WalletCreateDialogContainer from '../wallet/dialogs/WalletCreateDialogContainer';
import WalletBackupDialogContainer from '../wallet/dialogs/WalletBackupDialogContainer';
import environment from '../../environment';
import resolver from '../../utils/imports';
import type { InjectedProps } from '../../types/injectedPropsType';

type Props = InjectedProps;
const Layout = resolver('containers/MainLayout');


@inject('actions', 'stores') @observer
export default class WalletAddPage extends Component<Props> {

  static defaultProps = { actions: null, stores: null };

  onClose = () => {
    if (this.props.stores[environment.API].wallets.hasAnyWallets) {
      this.props.actions.dialogs.closeActiveDialog.trigger();
    } else {
      this.props.actions.dialogs.open.trigger({
        dialog: WalletAddDialog,
      });
    }
  };

  render() {
    const wallets = this._getWalletsStore();
    const { actions, stores } = this.props;
    const { uiDialogs } = stores;
    const { isRestoreActive } = wallets;
    let content = null;

    if (uiDialogs.isOpen(WalletCreateDialog)) {
      content = <WalletCreateDialogContainer onClose={this.onClose} />;
    } else if (uiDialogs.isOpen(WalletRestoreDialog)) {
      content = <WalletRestoreDialogContainer onClose={this.onClose} />;
    } else if (uiDialogs.isOpen(WalletBackupDialog)) {
      content = <WalletBackupDialogContainer onClose={this.onClose} />;
    } else {
      content = (
        <WalletAdd
          onCreate={() => actions.dialogs.open.trigger({ dialog: WalletCreateDialog })}
          onRestore={() => actions.dialogs.open.trigger({ dialog: WalletRestoreDialog })}
          onImportFile={() => {}}
          isRestoreActive={isRestoreActive}
          isMaxNumberOfWalletsReached={environment.isAdaApi() && wallets.hasMaxWallets}
        />
      );
    }
    return <Layout>{content}</Layout>;
  }

  _getWalletsStore() {
    return this.props.stores[environment.API].wallets;
  }

}
