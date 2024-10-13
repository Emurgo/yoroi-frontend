// @flow
import type { Node } from 'react';
import { Component } from 'react';
import type { StoresAndActionsProps } from '../../types/injectedProps.types';
import type { RestoreModeType } from '../../actions/common/wallet-restore-actions';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { intlShape } from 'react-intl';
import { observer } from 'mobx-react';
import { ROUTES } from '../../routes-config';
import { networks } from '../../api/ada/lib/storage/database/prepackaged/networks';
import { Box } from '@mui/material';
import TopBarLayout from '../../components/layout/TopBarLayout';
import BannerContainer from '../banners/BannerContainer';
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
import AddWalletPageRevamp from './AddWalletPageRevamp';

@observer
export default class AddWalletPage extends Component<StoresAndActionsProps> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  onClose: void => void = () => {
    if (!this.props.stores.wallets.hasAnyWallets) {
      this.props.stores.app.goToRoute({ route: ROUTES.WALLETS.ADD });
    }
    this.props.actions.dialogs.closeActiveDialog.trigger();
  };

  openDialogWrapper: any => void = dialog => {
    // we reset the API when we open a dialog instead of when we close a dialog
    // this is because on close, asynchronous unmount actions get triggered
    // so there is no safe time at which we can un-select the API
    // so instead, the API gets reset before we start any dialog flow
    this.props.stores.profile.setSelectedNetwork(undefined);

    this.props.actions.dialogs.open.trigger({ dialog });
  };

  render(): Node {
    const { actions, stores } = this.props;
    const { selectedNetwork } = stores.profile;
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
          onCardano={() => stores.profile.setSelectedNetwork(networks.CardanoMainnet)}
          onCardanoPreprodTestnet={() =>
            stores.profile.setSelectedNetwork(networks.CardanoPreprodTestnet)
          }
          onCardanoPreviewTestnet={() =>
            stores.profile.setSelectedNetwork(networks.CardanoPreviewTestnet)
          }
          onCardanoSanchoTestnet={() =>
            stores.profile.setSelectedNetwork(networks.CardanoSanchoTestnet)
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

    const { hasAnyWallets } = this.props.stores.wallets;
    const goToRoute = stores.app.goToRoute;
    const addWalletPageComponent = (
      <>
        <AddWalletPageRevamp
          onHardwareConnect={() => this.openDialogWrapper(WalletConnectHWOptionDialog)}
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
        banner={<BannerContainer actions={actions} stores={stores}/>}
        sidebar={<SidebarContainer actions={actions} stores={stores}/>}
      >
        {addWalletPageComponent}
      </TopBarLayout>
    );
  }

  _goToSettingsRoot: () => void = () => {
    this.props.stores.app.goToRoute({
      route: ROUTES.SETTINGS.ROOT,
    });
  };
}
