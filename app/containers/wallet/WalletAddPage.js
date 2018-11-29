// @flow
import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { intlShape, defineMessages } from 'react-intl';
import { ROUTES } from '../../routes-config';
import WalletAdd from '../../components/wallet/WalletAdd';
import WalletRestoreDialog from '../../components/wallet/WalletRestoreDialog';
import WalletCreateDialog from '../../components/wallet/WalletCreateDialog';
import WalletBackupDialog from '../../components/wallet/WalletBackupDialog';
import WalletRestoreDialogContainer from './dialogs/WalletRestoreDialogContainer';
import WalletCreateDialogContainer from './dialogs/WalletCreateDialogContainer';
import WalletBackupDialogContainer from './dialogs/WalletBackupDialogContainer';
import WalletTrezorConnectDialogContainer from './dialogs/WalletTrezorConnectDialogContainer';
import TextOnlyTopBar from '../../components/layout/TextOnlyTopbar';
import environment from '../../environment';
import resolver from '../../utils/imports';
import type { InjectedProps } from '../../types/injectedPropsType';

type Props = InjectedProps;
const MainLayout = resolver('containers/MainLayout');

const messages = defineMessages({
  title: {
    id: 'wallet.add.page.title',
    defaultMessage: '!!!Add Wallet',
    description: 'Add Wallet Title.'
  },
});

@inject('actions', 'stores') @observer
export default class WalletAddPage extends Component<Props> {

  static defaultProps = { actions: null, stores: null };

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
    const { sidebar } = this.props.stores;
    const topBar = (
      <TextOnlyTopBar
        title={this.context.intl.formatMessage(messages.title)}
        onCategoryClicked={category => {
          actions.sidebar.activateSidebarCategory.trigger({ category });
        }}
        categories={sidebar.CATEGORIES}
        activeSidebarCategory={sidebar.activeSidebarCategory}
      />);

    const wallets = this._getWalletsStore();
    const { actions, stores } = this.props;
    const { uiDialogs } = stores;
    const { isRestoreActive } = wallets;
    const { isTrezorConnectActive } = this._getTrezorConnectStore();
    const openTrezorConnect = () => {
      actions.dialogs.open.trigger({ dialog: WalletTrezorConnectDialogContainer });
    };
    let content = null;

    if (uiDialogs.isOpen(WalletCreateDialog)) {
      content = <WalletCreateDialogContainer onClose={this.onClose} />;
    } else if (uiDialogs.isOpen(WalletRestoreDialog)) {
      content = <WalletRestoreDialogContainer onClose={this.onClose} />;
    } else if (uiDialogs.isOpen(WalletBackupDialog)) {
      content = <WalletBackupDialogContainer onClose={this.onClose} />;
    } else if (uiDialogs.isOpen(WalletTrezorConnectDialogContainer)) { // TODO: to discuss ??
      content = <WalletTrezorConnectDialogContainer onClose={this.onClose} />;
    } else {
      content = (
        <WalletAdd
          onTrezor={openTrezorConnect} // TODO: to discuss ??
          isTrezorConnectActive={isTrezorConnectActive}
          onCreate={() => actions.dialogs.open.trigger({ dialog: WalletCreateDialog })}
          onRestore={() => actions.dialogs.open.trigger({ dialog: WalletRestoreDialog })}
          isRestoreActive={isRestoreActive}
        />
      );
    }
    return (
      <MainLayout topbar={topBar}>
        {content}
      </MainLayout>
    );
  }

  _getWalletsStore() {
    return this.props.stores.substores[environment.API].wallets;
  }

  _getTrezorConnectStore() {
    return this.props.stores.substores[environment.API].trezorConnect;
  }

}
