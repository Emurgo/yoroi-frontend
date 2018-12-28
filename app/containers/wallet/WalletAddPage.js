// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { intlShape, defineMessages } from 'react-intl';
import { ROUTES } from '../../routes-config';
import WalletAdd from '../../components/wallet/WalletAdd';
import WalletRestoreDialog from '../../components/wallet/WalletRestoreDialog';
import WalletCreateDialog from '../../components/wallet/WalletCreateDialog';
import WalletBackupDialog from '../../components/wallet/WalletBackupDialog';
import WalletTrezorConnectDialogContainer from './dialogs/WalletTrezorConnectDialogContainer';
import WalletCreateDialogContainer from './dialogs/WalletCreateDialogContainer';
import WalletRestoreDialogContainer from './dialogs/WalletRestoreDialogContainer';
import WalletBackupDialogContainer from './dialogs/WalletBackupDialogContainer';
import StaticTopbarTitle from '../../components/topbar/StaticTopbarTitle';
import TopBar from '../../components/topbar/TopBar';
import environment from '../../environment';
import resolver from '../../utils/imports';
import type { InjectedProps } from '../../types/injectedPropsType';
import AdaWalletsStore from '../../stores/ada/AdaWalletsStore';
import TrezorConnectStore from '../../stores/ada/TrezorConnectStore';

type Props = InjectedProps;
const MainLayout = resolver('containers/MainLayout');

const messages = defineMessages({
  title: {
    id: 'wallet.add.page.title',
    defaultMessage: '!!!Add Wallet',
    description: 'Add Wallet Title.'
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
    const { topbar, theme } = this.props.stores;
    const topbarTitle = (
      <StaticTopbarTitle title={this.context.intl.formatMessage(messages.title)} />
    );
    const topBar = (
      <TopBar
        title={topbarTitle}
        onCategoryClicked={category => {
          actions.topbar.activateTopbarCategory.trigger({ category });
        }}
        categories={topbar.CATEGORIES}
        activeTopbarCategory={topbar.activeTopbarCategory}
        oldTheme={theme.old}
        areCategoriesVisible={theme.old}
      />);

    const wallets = this._getWalletsStore();
    const { actions, stores } = this.props;
    const { uiDialogs } = stores;
    const { isRestoreActive } = wallets;
    const { isCreateTrezorWalletActive } = this._getTrezorConnectStore();
    const openTrezorConnectDialog = () => {
      actions.dialogs.open.trigger({ dialog: WalletTrezorConnectDialogContainer });
    };
    let content = null;

    if (uiDialogs.isOpen(WalletCreateDialog)) {
      content = (
        <WalletCreateDialogContainer actions={actions} stores={stores} onClose={this.onClose} />
      );
    } else if (uiDialogs.isOpen(WalletRestoreDialog)) {
      content = (
        <WalletRestoreDialogContainer actions={actions} stores={stores} onClose={this.onClose} />
      );
    } else if (uiDialogs.isOpen(WalletBackupDialog)) {
      content = (
        <WalletBackupDialogContainer actions={actions} stores={stores} onClose={this.onClose} />
      );
    } else if (uiDialogs.isOpen(WalletTrezorConnectDialogContainer)) {
      content = (
        <WalletTrezorConnectDialogContainer
          actions={actions}
          stores={stores}
          onClose={this.onClose}
        />
      );
    } else {
      content = (
        <WalletAdd
          onTrezor={openTrezorConnectDialog}
          isCreateTrezorWalletActive={isCreateTrezorWalletActive}
          onCreate={() => actions.dialogs.open.trigger({ dialog: WalletCreateDialog })}
          onRestore={() => actions.dialogs.open.trigger({ dialog: WalletRestoreDialog })}
          isRestoreActive={isRestoreActive}
          oldTheme={theme.old}
          title={this.context.intl.formatMessage(messages.title)}
        />
      );
    }
    const topBarCondition = (
      theme.old ||
      uiDialogs.isOpen(WalletCreateDialog) ||
      uiDialogs.isOpen(WalletRestoreDialog) ||
      uiDialogs.isOpen(WalletBackupDialog) ||
      uiDialogs.isOpen(WalletTrezorConnectDialogContainer)
    ) ? topBar : false;

    const bannerCondition = (
      theme.old ||
      uiDialogs.isOpen(WalletCreateDialog) ||
      uiDialogs.isOpen(WalletRestoreDialog) ||
      uiDialogs.isOpen(WalletBackupDialog) ||
      uiDialogs.isOpen(WalletTrezorConnectDialogContainer)
    );


    return (
      <MainLayout
        topbar={topBar}
        oldTheme={theme.old}
        actions={actions}
        stores={stores}
        isTopBarVisible={topBarCondition}
        isBannerVisible={bannerCondition}
      >
        {content}
      </MainLayout>
    );
  }

  _getWalletsStore(): AdaWalletsStore {
    return this.props.stores.substores[environment.API].wallets;
  }

  _getTrezorConnectStore(): TrezorConnectStore {
    return this.props.stores.substores[environment.API].trezorConnect;
  }

}
