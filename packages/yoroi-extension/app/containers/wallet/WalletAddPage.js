// @flow
import type { Node, ComponentType } from 'react';
import { Component } from 'react';
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

import WalletEraOptionDialogContainer from './dialogs/WalletEraOptionDialogContainer';
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

import type { RestoreModeType } from '../../actions/common/wallet-restore-actions';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { getApiForNetwork, ApiOptions } from '../../api/common/utils';
import { PublicDeriver } from '../../api/ada/lib/storage/models/PublicDeriver/index';
import type {
  NetworkRow,
} from '../../api/ada/lib/storage/database/primitives/tables';
import {
  networks, isJormungandr, isCardanoHaskell, isErgo,
} from '../../api/ada/lib/storage/database/prepackaged/networks';
import NavBarRevamp from '../../components/topbar/NavBarRevamp';
import { withLayout } from '../../styles/context/layout'
import type { LayoutComponentMap } from '../../styles/context/layout'

export type GeneratedData = typeof WalletAddPage.prototype.generated;

type Props = InjectedOrGenerated<GeneratedData>;
type InjectedProps = {| +renderLayoutComponent: LayoutComponentMap => Node |};
type AllProps = {| ...Props, ...InjectedProps |};

@observer
class WalletAddPage extends Component<AllProps> {
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
    this.generated.actions.profile.setSelectedNetwork.trigger(undefined);

    this.generated.actions.dialogs.open.trigger({ dialog });
  }

  componentDidMount() {
    this.generated.actions.wallets.unselectWallet.trigger();
  }

  render(): Node {
    const { selectedNetwork } = this.generated.stores.profile;
    const { actions, stores } = this.generated;
    const { uiDialogs } = stores;

    const openTrezorConnectDialog = (type: string) => {
      if (selectedNetwork === undefined) {
        throw new Error(`${nameof(WalletAddPage)} no API selected`);
      }
      const api = getApiForNetwork(selectedNetwork);
      actions.dialogs.push.trigger({
        dialog: WalletTrezorConnectDialogContainer,
        params: { restoreType: { type, extra: 'trezor' } },
      });
      if (api !== ApiOptions.ada) {
        throw new Error(`${nameof(WalletAddPage)} not ADA API type`);
      }
      this.generated.actions[ApiOptions.ada].trezorConnect.init.trigger();
    };
    const openLedgerConnectDialog = (type: string) => {
      if (selectedNetwork === undefined) {
        throw new Error(`${nameof(WalletAddPage)} no API selected`);
      }
      const api = getApiForNetwork(selectedNetwork);
      actions.dialogs.push.trigger({
        dialog: WalletLedgerConnectDialogContainer,
        params: { restoreType: { type, extra: 'ledger' } },
      });
      if (api !== ApiOptions.ada) {
        throw new Error(`${nameof(WalletAddPage)} not ADA API type`);
      }
      this.generated.actions[ApiOptions.ada].ledgerConnect.init.trigger();
    };

    let activeDialog = null;
    if (uiDialogs.hasOpen && selectedNetwork == null) {
      activeDialog = (<PickCurrencyDialogContainer
        onClose={this.onClose}
        onCardano={() => actions.profile.setSelectedNetwork.trigger(networks.CardanoMainnet)}
        onCardanoTestnet={() => actions.profile.setSelectedNetwork.trigger(networks.CardanoTestnet)}
        onCardanoPreprodTestnet={() => actions.profile.setSelectedNetwork.trigger(networks.CardanoPreprodTestnet)}
        onErgo={uiDialogs.isOpen(WalletConnectHWOptionDialog)
          ? undefined
          : () => actions.profile.setSelectedNetwork.trigger(networks.ErgoMainnet)}
        onAlonzoTestnet={
          () => actions.profile.setSelectedNetwork.trigger(networks.AlonzoTestnet)
        }
      />);
    } else if (uiDialogs.isOpen(WalletCreateOptionDialog)) {
      if (selectedNetwork === undefined) {
        throw new Error(`${nameof(WalletAddPage)} no API selected`);
      }
      activeDialog = (
        <WalletCreateOptionDialogContainer
          onClose={this.onClose}
          onCreate={() => actions.dialogs.push.trigger({ dialog: WalletCreateDialog })}
          onPaper={/* re-enable paper wallets once we have a good way to do them in Shelley */
            !isCardanoHaskell(selectedNetwork)
              ? undefined
              : () => actions.dialogs.push.trigger({ dialog: WalletPaperDialog })
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
        throw new Error(`${nameof(WalletAddPage)} no API selected`);
      }
      activeDialog = (
        <WalletRestoreOptionDialogContainer
          onClose={this.onClose}
          onRestore12={
            !isErgo(selectedNetwork)
              ? undefined
              : () => {
                return actions.dialogs.push.trigger({
                  dialog: WalletRestoreDialog,
                  params: { restoreType: { type: 'bip44', extra: undefined, length: 12 } }
                });
              }
          }
          onRestore15={() => {
            if (isCardanoHaskell(selectedNetwork)) {
              return actions.dialogs.push.trigger({
                dialog: WalletEraOptionDialogContainer,
              });
            }
            return actions.dialogs.push.trigger({
              dialog: WalletRestoreDialog,
              params: { restoreType: { type: 'bip44', extra: undefined, length: 15 } }
            });
          }}
          onRestore24={isJormungandr(selectedNetwork)
            ? undefined
            : () => actions.dialogs.push.trigger({
              dialog: WalletRestoreDialog,
              params: { restoreType: { type: 'cip1852', extra: undefined, length: 24 }  }
            })
          }
          onPaperRestore={
            getApiForNetwork(selectedNetwork) !== ApiOptions.ada || isJormungandr(selectedNetwork)
              ? undefined
              : () => actions.dialogs.push.trigger({
                dialog: WalletRestoreDialog,
                params: { restoreType: { type: 'bip44', extra: 'paper', length: 21 }  }
              })
          }
        />
      );
    } else if (uiDialogs.isOpen(WalletEraOptionDialogContainer)) {
      if (selectedNetwork === undefined) {
        throw new Error(`${nameof(WalletAddPage)} no API selected`);
      }
      const hardware = uiDialogs.getParam<'trezor' | 'ledger'>('hardware');
      const onEra = (era: 'bip44' | 'cip1852') => {
        if (hardware == null) {
          return actions.dialogs.push.trigger({
            dialog: WalletRestoreDialog,
            params: { restoreType: { type: era, extra: undefined, length: 15 }  }
          });
        }
        if (hardware === 'ledger') {
          openLedgerConnectDialog(era);
        }
        if (hardware === 'trezor') {
          openTrezorConnectDialog(era);
        }
      };
      activeDialog = (
        <WalletEraOptionDialogContainer
          onClose={this.onClose}
          onByron={() => onEra('bip44')}
          onShelley={() => onEra('cip1852')}
          onBack={() => actions.dialogs.pop.trigger()}
        />
      );
    } else if (uiDialogs.isOpen(WalletRestoreDialog)) {
      const mode = uiDialogs.getParam<RestoreModeType>('restoreType');
      if (mode == null) throw new Error(`${nameof(WalletAddPage)} no mode for restoration selected`);
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
          onTrezor={() => actions.dialogs.push.trigger({
            dialog: WalletEraOptionDialogContainer,
            params: { hardware: 'trezor' },
          })}
          onLedger={() => actions.dialogs.push.trigger({
            dialog: WalletEraOptionDialogContainer,
            params: { hardware: 'ledger' },
          })}
        />
      );
    } else if (uiDialogs.isOpen(WalletTrezorConnectDialogContainer)) {
      const mode = uiDialogs.getParam<RestoreModeType>('restoreType');
      if (mode == null) throw new Error(`${nameof(WalletAddPage)} no mode for restoration selected`);
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
      if (mode == null) throw new Error(`${nameof(WalletAddPage)} no mode for restoration selected`);
      activeDialog = (
        <WalletLedgerConnectDialogContainer
          {...this.generated.WalletLedgerConnectDialogContainerProps}
          mode={mode}
          onClose={this.onClose}
          onBack={() => actions.dialogs.pop.trigger()}
        />
      );
    }

    const { hasAnyWallets } = this.generated.stores.wallets;
    if (!hasAnyWallets) {
      return (
        <TopBarLayout
          banner={(<BannerContainer {...this.generated.BannerContainerProps} />)}
          asModern
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


    const navbarElementClassic = (
      <NavBar
        title={
          <NavBarTitle title={this.context.intl.formatMessage(globalMessages.addWalletLabel)} />
        }
      />
    );

    const navbarElementRevamp = (
      <NavBarRevamp
        title={
          <NavBarTitle title={this.context.intl.formatMessage(globalMessages.addWalletLabel)} />
        }
      />
    );

    const navbarElement = this.props.renderLayoutComponent({
      CLASSIC: navbarElementClassic,
      REVAMP: navbarElementRevamp,
    });

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

  @computed get generated(): {|
    BannerContainerProps: InjectedOrGenerated<BannerContainerData>,
    CreatePaperWalletDialogContainerProps:
      InjectedOrGenerated<CreatePaperWalletDialogContainerData>,
    SidebarContainerProps: InjectedOrGenerated<SidebarContainerData>,
    WalletBackupDialogContainerProps: InjectedOrGenerated<WalletBackupDialogContainerData>,
    WalletCreateDialogContainerProps: InjectedOrGenerated<WalletCreateDialogContainerData>,
    WalletLedgerConnectDialogContainerProps:
      InjectedOrGenerated<WalletLedgerConnectDialogContainerData>,
    WalletPaperDialogContainerProps: InjectedOrGenerated<WalletPaperDialogContainerData>,
    WalletRestoreDialogContainerProps: InjectedOrGenerated<WalletRestoreDialogContainerData>,
    WalletTrezorConnectDialogContainerProps:
      InjectedOrGenerated<WalletTrezorConnectDialogContainerData>,
    actions: {|
      ada: {|
        ledgerConnect: {|
          init: {| trigger: (params: void) => void |}
        |},
        trezorConnect: {|
          init: {| trigger: (params: void) => void |}
        |}
      |},
      dialogs: {|
        closeActiveDialog: {|
          trigger: (params: void) => void
        |},
        open: {|
          trigger: (params: {|
            dialog: any,
            params?: any
          |}) => void
        |},
        push: {|
          trigger: (params: {|
            dialog: any,
            params?: any
          |}) => void
        |},
        pop: {|
          trigger: void => void,
        |},
      |},
      profile: {|
        setSelectedNetwork: {|
          trigger: (params: void | $ReadOnly<NetworkRow>) => void
        |}
      |},
      router: {|
        goToRoute: {|
          trigger: (params: {|
            publicDeriver?: null | PublicDeriver<>,
            params?: ?any,
            route: string
          |}) => void
        |}
      |},
      wallets: {|
        unselectWallet: {| trigger: (params: void) => void |}
      |}
    |},
    stores: {|
      profile: {| selectedNetwork: void | $ReadOnly<NetworkRow> |},
      uiDialogs: {|
        hasOpen: boolean,
        getParam: <T>(number | string) => (void | T),
        isOpen: any => boolean
      |},
      wallets: {| hasAnyWallets: boolean |}
    |}
    |} {
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
export default (withLayout(WalletAddPage): ComponentType<Props>)