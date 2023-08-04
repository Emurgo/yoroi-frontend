// @flow
import type { Node, ComponentType } from 'react';
import { Component, lazy } from 'react';
import { observer } from 'mobx-react';
import { computed } from 'mobx';
import { intlShape } from 'react-intl';

import { ROUTES } from '../../routes-config';
import type { InjectedOrGenerated } from '../../types/injectedPropsType';
import globalMessages from '../../i18n/global-messages';

import TopBarLayout from '../../components/layout/TopBarLayout';
import BannerContainer from '../banners/BannerContainer';
import type { GeneratedData as BannerContainerData } from '../banners/BannerContainer';
import WalletAdd from '../../components/wallet/WalletAdd';

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

import WalletConnectHWOptionDialogContainer from './dialogs/WalletConnectHWOptionDialogContainer';
import WalletConnectHWOptionDialog from '../../components/wallet/add/option-dialog/WalletConnectHWOptionDialog';
import WalletTrezorConnectDialogContainer from './dialogs/WalletTrezorConnectDialogContainer';
import type { GeneratedData as WalletTrezorConnectDialogContainerData } from './dialogs/WalletTrezorConnectDialogContainer';
import WalletLedgerConnectDialogContainer from './dialogs/WalletLedgerConnectDialogContainer';
import type { GeneratedData as WalletLedgerConnectDialogContainerData } from './dialogs/WalletLedgerConnectDialogContainer';

import WalletPaperDialog from '../../components/wallet/WalletPaperDialog';
import WalletPaperDialogContainer from './dialogs/WalletPaperDialogContainer';
import type { GeneratedData as WalletPaperDialogContainerData } from './dialogs/WalletPaperDialogContainer';
import CreatePaperWalletDialogContainer from './dialogs/CreatePaperWalletDialogContainer';
import type { GeneratedData as CreatePaperWalletDialogContainerData } from './dialogs/CreatePaperWalletDialogContainer';
import UserPasswordDialog from '../../components/wallet/add/paper-wallets/UserPasswordDialog';

import SidebarContainer from '../SidebarContainer';
import type { GeneratedData as SidebarContainerData } from '../SidebarContainer';
import NavBar from '../../components/topbar/NavBar';
import NavBarTitle from '../../components/topbar/NavBarTitle';

import type { RestoreModeType } from '../../actions/common/wallet-restore-actions';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { getApiForNetwork, ApiOptions } from '../../api/common/utils';
import { PublicDeriver } from '../../api/ada/lib/storage/models/PublicDeriver/index';
import type { NetworkRow } from '../../api/ada/lib/storage/database/primitives/tables';
import { networks } from '../../api/ada/lib/storage/database/prepackaged/networks';
import { withLayout } from '../../styles/context/layout';
import type { LayoutComponentMap } from '../../styles/context/layout';
import AddWalletPageRevamp from './AddWalletPageRevamp';

export const AddAnotherWalletPromise: void => Promise<any> = () =>
  import('../../components/wallet/add/AddAnotherWallet');
const AddAnotherWallet = lazy(AddAnotherWalletPromise);

export type GeneratedData = typeof AddWalletPage.prototype.generated;

type Props = InjectedOrGenerated<GeneratedData>;
type InjectedProps = {| +renderLayoutComponent: LayoutComponentMap => Node |};
type AllProps = {| ...Props, ...InjectedProps |};

@observer
class AddWalletPage extends Component<AllProps> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  onClose: void => void = () => {
    if (!this.generated.stores.wallets.hasAnyWallets) {
      this.generated.actions.router.goToRoute.trigger({ route: ROUTES.WALLETS.ADD });
    }
    this.generated.actions.dialogs.closeActiveDialog.trigger();
  };

  openDialogWrapper: any => void = dialog => {
    // we reset the API when we open a dialog instead of when we close a dialog
    // this is because on close, asynchronous unmount actions get triggered
    // so there is no safe time at which we can un-select the API
    // so instead, the API gets reset before we start any dialog flow
    this.generated.actions.profile.setSelectedNetwork.trigger(undefined);

    this.generated.actions.dialogs.open.trigger({ dialog });
  };

  componentDidMount() {
    this.generated.actions.wallets.unselectWallet.trigger();
  }

  render(): Node {
    const { selectedNetwork } = this.generated.stores.profile;
    const { actions, stores } = this.generated;
    const { uiDialogs } = stores;

    const openTrezorConnectDialog = (type: string) => {
      if (selectedNetwork === undefined) {
        throw new Error(`${nameof(AddWalletPage)} no API selected`);
      }
      const api = getApiForNetwork(selectedNetwork);
      actions.dialogs.push.trigger({
        dialog: WalletTrezorConnectDialogContainer,
        params: { restoreType: { type, extra: 'trezor' } },
      });
      if (api !== ApiOptions.ada) {
        throw new Error(`${nameof(AddWalletPage)} not ADA API type`);
      }
      this.generated.actions[ApiOptions.ada].trezorConnect.init.trigger();
    };
    const openLedgerConnectDialog = (type: string) => {
      if (selectedNetwork === undefined) {
        throw new Error(`${nameof(AddWalletPage)} no API selected`);
      }
      const api = getApiForNetwork(selectedNetwork);
      actions.dialogs.push.trigger({
        dialog: WalletLedgerConnectDialogContainer,
        params: { restoreType: { type, extra: 'ledger' } },
      });
      if (api !== ApiOptions.ada) {
        throw new Error(`${nameof(AddWalletPage)} not ADA API type`);
      }
      this.generated.actions[ApiOptions.ada].ledgerConnect.init.trigger();
    };

    let activeDialog = null;
    if (uiDialogs.hasOpen && selectedNetwork == null) {
      activeDialog = (
        <PickCurrencyDialogContainer
          onClose={this.onClose}
          onCardano={() => actions.profile.setSelectedNetwork.trigger(networks.CardanoMainnet)}
          onCardanoPreprodTestnet={() =>
            actions.profile.setSelectedNetwork.trigger(networks.CardanoPreprodTestnet)
          }
          onCardanoPreviewTestnet={() =>
            actions.profile.setSelectedNetwork.trigger(networks.CardanoPreviewTestnet)
          }
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
      // <TODO:PENDING_REMOVAL>
      activeDialog = (
        <WalletPaperDialogContainer
          {...this.generated.WalletPaperDialogContainerProps}
          onClose={this.onClose}
        />
      );
    } else if (uiDialogs.isOpen(UserPasswordDialog)) {
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
          onPaperRestore={
            // <TODO:PENDING_REMOVAL>
            getApiForNetwork(selectedNetwork) !== ApiOptions.ada 
              ? undefined
              : () =>
                  actions.dialogs.push.trigger({
                    dialog: WalletRestoreDialogContainer,
                    params: { restoreType: { type: 'bip44', extra: 'paper', length: 21 } },
                  })
          }
        />
      );
    } else if (uiDialogs.isOpen(WalletRestoreDialogContainer)) {
      const mode = uiDialogs.getParam<RestoreModeType>('restoreType');
      if (mode == null)
        throw new Error(`${nameof(AddWalletPage)} no mode for restoration selected`);
      activeDialog = (
        <WalletRestoreDialogContainer
          {...this.generated.WalletRestoreDialogContainerProps}
          onClose={this.onClose}
          onBack={() => actions.dialogs.pop.trigger()}
          mode={mode}
        />
      );
    } else if (uiDialogs.isOpen(WalletConnectHWOptionDialog)) {
      activeDialog = (
        <WalletConnectHWOptionDialogContainer
          onClose={this.onClose}
          onTrezor={() => openTrezorConnectDialog('cip1852')}
          onLedger={() => openLedgerConnectDialog('cip1852')}
        />
      );
    } else if (uiDialogs.isOpen(WalletTrezorConnectDialogContainer)) {
      const mode = uiDialogs.getParam<RestoreModeType>('restoreType');
      if (mode == null)
        throw new Error(`${nameof(AddWalletPage)} no mode for restoration selected`);
      activeDialog = (
        <WalletTrezorConnectDialogContainer
          {...this.generated.WalletTrezorConnectDialogContainerProps}
          mode={mode}
          onClose={this.onClose}
          onBack={() => actions.dialogs.pop.trigger()}
        />
      );
    } else if (uiDialogs.isOpen(WalletLedgerConnectDialogContainer)) {
      const mode = uiDialogs.getParam<RestoreModeType>('restoreType');
      if (mode == null)
        throw new Error(`${nameof(AddWalletPage)} no mode for restoration selected`);
      activeDialog = (
        <WalletLedgerConnectDialogContainer
          {...this.generated.WalletLedgerConnectDialogContainerProps}
          mode={mode}
          onClose={this.onClose}
          onBack={() => actions.dialogs.pop.trigger()}
        />
      );
    }

    let addWalletPageClassic = (
      <TopBarLayout
        banner={<BannerContainer {...this.generated.BannerContainerProps} />}
        sidebar={<SidebarContainer {...this.generated.SidebarContainerProps} />}
        navbar={
          <NavBar
            title={
              <NavBarTitle title={this.context.intl.formatMessage(globalMessages.addWalletLabel)} />
            }
          />
        }
        showInContainer
      >
        <AddAnotherWallet
          onHardwareConnect={() => this.openDialogWrapper(WalletConnectHWOptionDialog)}
          onCreate={() => this.openDialogWrapper(WalletCreateDialog)}
          onRestore={() => this.openDialogWrapper(WalletRestoreOptionDialog)}
        />
        {activeDialog}
      </TopBarLayout>
    );

    const { hasAnyWallets } = this.generated.stores.wallets;
    if (!hasAnyWallets) {
      addWalletPageClassic = (
        <TopBarLayout
          banner={<BannerContainer {...this.generated.BannerContainerProps} />}
          asModern
        >
          <WalletAdd
            onHardwareConnect={() => this.openDialogWrapper(WalletConnectHWOptionDialog)}
            onCreate={() => this.openDialogWrapper(WalletCreateDialog)}
            onRestore={() => this.openDialogWrapper(WalletRestoreOptionDialog)}
            onSettings={this._goToSettingsRoot}
            onDaedalusTransfer={this._goToDaedalusTransferRoot}
          />
          {activeDialog}
        </TopBarLayout>
      );
    }

    const goToRoute = this.generated.actions.router.goToRoute;
    const addWalletPageRevamp = (
      <TopBarLayout
        banner={<BannerContainer {...this.generated.BannerContainerProps} />}
        sidebar={<SidebarContainer {...this.generated.SidebarContainerProps} />}
      >
        <AddWalletPageRevamp
          onHardwareConnect={() => this.openDialogWrapper(WalletConnectHWOptionDialog)}
          onCreate={() => goToRoute.trigger({ route: ROUTES.WALLETS.CREATE_NEW_WALLET })}
          onRestore={() => goToRoute.trigger({ route: ROUTES.WALLETS.RESTORE_WALLET })}
          goToCurrentWallet={() => goToRoute.trigger({ route: ROUTES.WALLETS.TRANSACTIONS })}
          hasAnyWallets={hasAnyWallets}
        />
        {activeDialog}
      </TopBarLayout>
    );

    return this.props.renderLayoutComponent({
      CLASSIC: addWalletPageClassic,
      REVAMP: addWalletPageRevamp,
    });
  }

  _goToSettingsRoot: () => void = () => {
    this.generated.actions.router.goToRoute.trigger({
      route: ROUTES.SETTINGS.ROOT,
    });
  };

  _goToDaedalusTransferRoot: () => void = () => {
    this.generated.actions.router.goToRoute.trigger({
      route: ROUTES.TRANSFER.DAEDALUS,
    });
  };

  @computed get generated(): {|
    BannerContainerProps: InjectedOrGenerated<BannerContainerData>,
    CreatePaperWalletDialogContainerProps: InjectedOrGenerated<CreatePaperWalletDialogContainerData>,
    SidebarContainerProps: InjectedOrGenerated<SidebarContainerData>,
    WalletBackupDialogContainerProps: InjectedOrGenerated<WalletBackupDialogContainerData>,
    WalletCreateDialogContainerProps: InjectedOrGenerated<WalletCreateDialogContainerData>,
    WalletLedgerConnectDialogContainerProps: InjectedOrGenerated<WalletLedgerConnectDialogContainerData>,
    WalletPaperDialogContainerProps: InjectedOrGenerated<WalletPaperDialogContainerData>,
    WalletRestoreDialogContainerProps: InjectedOrGenerated<WalletRestoreDialogContainerData>,
    WalletTrezorConnectDialogContainerProps: InjectedOrGenerated<WalletTrezorConnectDialogContainerData>,
    actions: {|
      ada: {|
        ledgerConnect: {|
          init: {| trigger: (params: void) => void |},
        |},
        trezorConnect: {|
          init: {| trigger: (params: void) => void |},
        |},
      |},
      dialogs: {|
        closeActiveDialog: {|
          trigger: (params: void) => void,
        |},
        open: {|
          trigger: (params: {|
            dialog: any,
            params?: any,
          |}) => void,
        |},
        push: {|
          trigger: (params: {|
            dialog: any,
            params?: any,
          |}) => void,
        |},
        pop: {|
          trigger: void => void,
        |},
      |},
      profile: {|
        setSelectedNetwork: {|
          trigger: (params: void | $ReadOnly<NetworkRow>) => void,
        |},
      |},
      router: {|
        goToRoute: {|
          trigger: (params: {|
            publicDeriver?: null | PublicDeriver<>,
            params?: ?any,
            route: string,
          |}) => void,
        |},
      |},
      wallets: {|
        unselectWallet: {| trigger: (params: void) => void |},
      |},
    |},
    stores: {|
      profile: {| selectedNetwork: void | $ReadOnly<NetworkRow> |},
      uiDialogs: {|
        hasOpen: boolean,
        getParam: <T>(number | string) => void | T,
        isOpen: any => boolean,
      |},
      wallets: {| hasAnyWallets: boolean |},
    |},
  |} {
    if (this.props.generated !== undefined) {
      return this.props.generated;
    }
    if (this.props.stores == null || this.props.actions == null) {
      throw new Error(`${nameof(AddWalletPage)} no way to generated props`);
    }
    const { stores, actions } = this.props;
    return Object.freeze({
      stores: {
        profile: {
          selectedNetwork: stores.profile.selectedNetwork,
        },
        uiDialogs: {
          hasOpen: stores.uiDialogs.hasOpen,
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
          push: {
            trigger: actions.dialogs.push.trigger,
          },
          pop: {
            trigger: actions.dialogs.pop.trigger,
          },
        },
        profile: {
          setSelectedNetwork: {
            trigger: actions.profile.setSelectedNetwork.trigger,
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
      SidebarContainerProps: ({ actions, stores }: InjectedOrGenerated<SidebarContainerData>),
      WalletCreateDialogContainerProps: ({
        actions,
        stores,
      }: InjectedOrGenerated<WalletCreateDialogContainerData>),
      WalletPaperDialogContainerProps: ({
        actions,
        stores,
      }: InjectedOrGenerated<WalletPaperDialogContainerData>),
      CreatePaperWalletDialogContainerProps: ({
        stores,
        actions,
      }: InjectedOrGenerated<CreatePaperWalletDialogContainerData>),
      WalletBackupDialogContainerProps: ({
        actions,
        stores,
      }: InjectedOrGenerated<WalletBackupDialogContainerData>),
      WalletRestoreDialogContainerProps: ({
        actions,
        stores,
      }: InjectedOrGenerated<WalletRestoreDialogContainerData>),
      WalletTrezorConnectDialogContainerProps: ({
        actions,
        stores,
      }: InjectedOrGenerated<WalletTrezorConnectDialogContainerData>),
      WalletLedgerConnectDialogContainerProps: ({
        actions,
        stores,
      }: InjectedOrGenerated<WalletLedgerConnectDialogContainerData>),
      BannerContainerProps: ({ actions, stores }: InjectedOrGenerated<BannerContainerData>),
    });
  }
}
export default (withLayout(AddWalletPage): ComponentType<Props>);
