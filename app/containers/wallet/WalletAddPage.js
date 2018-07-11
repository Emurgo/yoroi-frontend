// @flow
import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { intlShape, defineMessages } from 'react-intl';
import { ROUTES } from '../../routes-config';
import WalletAdd from '../../components/wallet/WalletAdd';
import WalletRestoreDialog from '../../components/wallet/WalletRestoreDialog';
import WalletCreateDialog from '../../components/wallet/WalletCreateDialog';
import WalletBackupDialog from '../../components/wallet/WalletBackupDialog';
import WalletRestoreDialogContainer from '../wallet/dialogs/WalletRestoreDialogContainer';
import WalletCreateDialogContainer from '../wallet/dialogs/WalletCreateDialogContainer';
import WalletBackupDialogContainer from '../wallet/dialogs/WalletBackupDialogContainer';
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
    if (!this.props.stores[environment.API].wallets.hasAnyWallets) {
      this.props.actions.router.goToRoute.trigger({ route: ROUTES.WALLETS.ADD });
    }
    this.props.actions.dialogs.closeActiveDialog.trigger();
  };

  render() {
    const { sidebar } = this.props.stores;
    const topBar = (
      <TextOnlyTopBar
        title={this.context.intl.formatMessage(messages.title)}
        activeSidebarCategory={sidebar.activeSidebarCategory}
      />);
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
    return this.props.stores[environment.API].wallets;
  }

}
