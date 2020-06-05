// @flow
import type { Node } from 'react';
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { computed } from 'mobx';
import { intlShape } from 'react-intl';

import { ROUTES } from '../../routes-config';
import type { InjectedOrGenerated } from '../../types/injectedPropsType';
import globalMessages from '../../i18n/global-messages';

import TopBarLayout from '../../components/layout/TopBarLayout';
import BannerContainer from '../BannerContainer';
import type { GeneratedData as BannerContainerData } from '../BannerContainer';
import WalletAdd from '../../components/wallet/WalletAdd';
import AddAnotherWallet from '../../components/wallet/add/AddAnotherWallet';

import WalletCreateDialogContainer from './dialogs/WalletCreateDialogContainer';
import type { GeneratedData as WalletCreateDialogContainerData } from './dialogs/WalletCreateDialogContainer';
import WalletCreateDialog from '../../components/wallet/WalletCreateDialog';
import WalletBackupDialogContainer from './dialogs/WalletBackupDialogContainer';
import type { GeneratedData as WalletBackupDialogContainerData } from './dialogs/WalletBackupDialogContainer';
import WalletBackupDialog from '../../components/wallet/WalletBackupDialog';

import PickCurrencyDialogContainer from './dialogs/PickCurrencyDialogContainer';

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

import WalletCreateOptionDialog from '../../components/wallet/add/option-dialog/WalletCreateOptionDialog';
import WalletCreateOptionDialogContainer from './dialogs/WalletCreateOptionDialogContainer';
import WalletPaperDialog from '../../components/wallet/WalletPaperDialog';
import WalletPaperDialogContainer from './dialogs/WalletPaperDialogContainer';
import type { GeneratedData as WalletPaperDialogContainerData } from './dialogs/WalletPaperDialogContainer';
import CreatePaperWalletDialogContainer from './dialogs/CreatePaperWalletDialogContainer';
import type {
  GeneratedData as CreatePaperWalletDialogContainerData
} from './dialogs/CreatePaperWalletDialogContainer';
import UserPasswordDialog from '../../components/wallet/add/paper-wallets/UserPasswordDialog';

import SidebarContainer from '../SidebarContainer';
import type { GeneratedData as SidebarContainerData } from '../SidebarContainer';
import NavBar from '../../components/topbar/NavBar';
import NavBarTitle from '../../components/topbar/NavBarTitle';

import type { RestoreModeType } from '../../actions/ada/wallet-restore-actions';
import { RestoreMode } from '../../actions/ada/wallet-restore-actions';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';

export type GeneratedData = typeof WalletAddPage.prototype.generated;

type Props = InjectedOrGenerated<GeneratedData>;

@observer
export default class WalletAddPage extends Component<Props> {
  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };

  onClose: void => void = () => {
    if (!this.generated.stores.wallets.hasAnyWallets) {
      this.generated.actions.router.goToRoute.trigger({ route: ROUTES.WALLETS.ADD });
    }
    this.generated.actions.dialogs.closeActiveDialog.trigger();
  };

  openDialogWrapper: any => void = (dialog) => {
    // we reset the API when we open a dialog instead of when we close a dialog
    // this is because on close, asynchronous unmount actions get triggered
    // so there is no safe time at which we can un-select the API
    // so instead, the API gets reset before we start any dialog flow
    this.generated.actions.profile.setSelectedAPI.trigger(undefined);

    this.generated.actions.dialogs.open.trigger({ dialog });
  }

  componentDidMount() {
    this.generated.actions.wallets.unselectWallet.trigger();
  }

  render(): Node {
    const { selectedAPI } = this.generated.stores.profile;
    const { actions, stores } = this.generated;
    const { uiDialogs } = stores;

    const openTrezorConnectDialog = () => {
      if (selectedAPI === undefined) {
        throw new Error(`${nameof(WalletAddPage)} no API selected`);
      }
      actions.dialogs.open.trigger({ dialog: WalletTrezorConnectDialogContainer });
      this.generated.actions[selectedAPI.type].trezorConnect.init.trigger();
    };
    const openLedgerConnectDialog = () => {
      if (selectedAPI === undefined) {
        throw new Error(`${nameof(WalletAddPage)} no API selected`);
      }
      actions.dialogs.open.trigger({ dialog: WalletLedgerConnectDialogContainer });
      this.generated.actions[selectedAPI.type].ledgerConnect.init.trigger();
    };

    let activeDialog = null;
    if (uiDialogs.activeDialog != null && selectedAPI == null) {
      activeDialog = (<PickCurrencyDialogContainer
        onClose={this.onClose}
        onCardano={() => this.generated.actions.profile.setSelectedAPI.trigger('ada')}
      />);
    } else if (uiDialogs.isOpen(WalletCreateOptionDialog)) {
      activeDialog = (
        <WalletCreateOptionDialogContainer
          onClose={this.onClose}
          onCreate={() => actions.dialogs.open.trigger({ dialog: WalletCreateDialog })}
          onPaper={() => actions.dialogs.open.trigger(
            { dialog: WalletPaperDialog }
          )}
        />
      );
    } else if (uiDialogs.isOpen(WalletCreateDialog)) {
      activeDialog = (
        <WalletCreateDialogContainer
          {...this.generated.WalletCreateDialogContainerProps}
          onClose={this.onClose}
        />
      );
    } else if (uiDialogs.isOpen(WalletPaperDialog)) {
      activeDialog = (
        <WalletPaperDialogContainer
          {...this.generated.WalletPaperDialogContainerProps}
          onClose={this.onClose}
        />
      );
    } else if (uiDialogs.isOpen(UserPasswordDialog)) {
      console.log('zxvasdf');
      activeDialog = (
        <CreatePaperWalletDialogContainer
          {...this.generated.CreatePaperWalletDialogContainerProps}
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
        <TopBarLayout
          banner={(<BannerContainer {...this.generated.BannerContainerProps} />)}
        >
          <WalletAdd
            onHardwareConnect={
              () => this.openDialogWrapper(WalletConnectHWOptionDialog)
            }
            onCreate={() => this.openDialogWrapper(WalletCreateOptionDialog)}
            onRestore={() =>  this.openDialogWrapper(WalletRestoreOptionDialog)}
            onSettings={this._goToSettingsRoot}
            onDaedalusTransfer={this._goToDaedalusTransferRoot}
          />
          {activeDialog}
        </TopBarLayout>
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
      <TopBarLayout
        banner={(<BannerContainer {...this.generated.BannerContainerProps} />)}
        sidebar={<SidebarContainer {...this.generated.SidebarContainerProps} />}
        navbar={navbarElement}
        showInContainer
      >
        <AddAnotherWallet
          onHardwareConnect={
            () => this.openDialogWrapper(WalletConnectHWOptionDialog)
          }
          onCreate={() => this.openDialogWrapper(WalletCreateOptionDialog)}
          onRestore={() => this.openDialogWrapper(WalletRestoreOptionDialog)}
        />
        {activeDialog}
      </TopBarLayout>
    );
  }

  _goToSettingsRoot: (() => void) = () => {
    this.generated.actions.router.goToRoute.trigger({
      route: ROUTES.SETTINGS.ROOT
    });
  }

  _goToDaedalusTransferRoot: (() => void) = () => {
    this.generated.actions.router.goToRoute.trigger({
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
        profile: {
          selectedAPI: stores.profile.selectedAPI,
        },
        uiDialogs: {
          activeDialog: stores.uiDialogs.activeDialog,
          isOpen: stores.uiDialogs.isOpen,
          getParam: stores.uiDialogs.getParam,
        },
        wallets: {
          hasAnyWallets: stores.wallets.hasAnyWallets,
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
        profile: {
          setSelectedAPI: {
            trigger: actions.profile.setSelectedAPI.trigger,
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
      WalletPaperDialogContainerProps: (
        { actions, stores, }: InjectedOrGenerated<WalletPaperDialogContainerData>
      ),
      CreatePaperWalletDialogContainerProps: (
        { stores, actions }: InjectedOrGenerated<CreatePaperWalletDialogContainerData>
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
      BannerContainerProps: ({ actions, stores }: InjectedOrGenerated<BannerContainerData>),
    });
  }
}
