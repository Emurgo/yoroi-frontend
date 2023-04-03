// @flow
import type { Node } from 'react';
import type { GeneratedData as BannerContainerData } from '../../banners/BannerContainer';
import type { GeneratedData as SidebarContainerData } from '../../SidebarContainer';
import type { InjectedOrGenerated } from '../../../types/injectedPropsType';
import type { WalletRestoreMeta } from '../../../actions/common/wallet-restore-actions';
import type { PlateWithMeta, RestoreStepsType } from '../../../stores/toplevel/WalletRestoreStore';
import type { RestoreModeType } from '../../../actions/common/wallet-restore-actions';
import type { NetworkRow } from '../../../api/ada/lib/storage/database/primitives/tables';
import type { ConceptualWalletSettingsCache } from '../../../stores/toplevel/WalletSettingsStore';
import type { ConceptualWallet } from '../../../api/ada/lib/storage/models/ConceptualWallet';
import type { TokenInfoMap } from '../../../stores/toplevel/TokenInfoStore';
import type { TxRequests } from '../../../stores/toplevel/TransactionsStore';
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { computed } from 'mobx';
import { SelectedExplorer } from '../../../domain/SelectedExplorer';
import { PublicDeriver } from '../../../api/ada/lib/storage/models/PublicDeriver';
import TopBarLayout from '../../../components/layout/TopBarLayout';
import BannerContainer from '../../banners/BannerContainer';
import SidebarContainer from '../../SidebarContainer';
import LocalizableError from '../../../i18n/LocalizableError';

export const RestoreWalletPagePromise: void => Promise<any> = () =>
  import('../../../components/wallet/restore/RestoreWalletPage');
const RestoreWalletPageComponent = React.lazy(RestoreWalletPagePromise);

export type GeneratedData = typeof RestoreWalletPage.prototype.generated;
type Props = InjectedOrGenerated<GeneratedData>;

@observer
export default class RestoreWalletPage extends Component<Props> {
  render(): Node {
    const { stores, actions } = this.generated;

    return (
      <TopBarLayout
        banner={<BannerContainer {...this.generated.BannerContainerProps} />}
        sidebar={<SidebarContainer {...this.generated.SidebarContainerProps} />}
      >
        <RestoreWalletPageComponent
          createWallet={actions.ada.wallets.createWallet.trigger}
          stores={stores}
          actions={actions}
          openDialog={dialog => this.generated.actions.dialogs.open.trigger({ dialog })}
          closeDialog={this.generated.actions.dialogs.closeActiveDialog.trigger}
          isDialogOpen={stores.uiDialogs.isOpen}
        />
      </TopBarLayout>
    );
  }

  @computed get generated(): {|
    BannerContainerProps: InjectedOrGenerated<BannerContainerData>,
    SidebarContainerProps: InjectedOrGenerated<SidebarContainerData>,
    actions: {|
      walletRestore: {|
        back: {| trigger: (params: void) => void |},
        reset: {| trigger: (params: void) => void |},
        setMode: {| trigger: (params: RestoreModeType) => void |},
        startCheck: {| trigger: (params: void) => Promise<void> |},
        startRestore: {| trigger: (params: void) => Promise<void> |},
        submitFields: {| trigger: (params: WalletRestoreMeta) => Promise<void> |},
        verifyMnemonic: {| trigger: (params: void) => Promise<void> |},
      |},
      ada: {|
        wallets: {|
          createWallet: {|
            trigger: ({|
              walletName: string,
              walletPassword: string,
              recoveryPhrase: Array<string>,
            |}) => Promise<void>,
          |},
        |},
      |},
      profile: {|
        setSelectedNetwork: {| trigger: (params: void | $ReadOnly<NetworkRow>) => void |},
      |},
      wallets: {|
        setActiveWallet: {| trigger: (params: {| wallet: PublicDeriver<> |}) => void |},
      |},
      dialogs: {|
        closeActiveDialog: {| trigger: (params: void) => void |},
        open: {| trigger: (params: {| dialog: any, params?: any |}) => void |},
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
    |},
    stores: {|
      explorers: {| selectedExplorer: Map<number, SelectedExplorer> |},
      profile: {| selectedNetwork: void | $ReadOnly<NetworkRow> |},
      transactions: {| getTxRequests: (PublicDeriver<>) => TxRequests |},
      tokenInfoStore: {| tokenInfo: TokenInfoMap |},
      uiDialogs: {| isOpen: any => boolean |},
      walletSettings: {|
        getConceptualWalletSettingsCache: ConceptualWallet => ConceptualWalletSettingsCache,
      |},
      walletRestore: {|
        recoveryResult: void | {| plates: Array<PlateWithMeta>, phrase: string |},
        step: RestoreStepsType,
        duplicatedWallet: null | void | PublicDeriver<>,
        walletRestoreMeta: void | WalletRestoreMeta,
        isValidMnemonic: ({| mnemonic: string, mode: RestoreModeType |}) => boolean,
        getMode: () => void | RestoreModeType,
      |},
      wallets: {|
        restoreRequest: {| error: ?LocalizableError, isExecuting: boolean, reset: () => void |},
        publicDerivers: Array<PublicDeriver<>>,
      |},
    |},
  |} {
    if (this.props.generated !== undefined) {
      return this.props.generated;
    }
    if (this.props.stores == null || this.props.actions == null) {
      throw new Error(`${nameof(RestoreWalletPage)} no way to generated props`);
    }
    const { stores, actions } = this.props;
    return Object.freeze({
      BannerContainerProps: ({ actions, stores }: InjectedOrGenerated<BannerContainerData>),
      SidebarContainerProps: ({ actions, stores }: InjectedOrGenerated<SidebarContainerData>),
      stores: {
        explorers: { selectedExplorer: stores.explorers.selectedExplorer },
        profile: { selectedNetwork: stores.profile.selectedNetwork },
        transactions: { getTxRequests: stores.transactions.getTxRequests },
        tokenInfoStore: { tokenInfo: stores.tokenInfoStore.tokenInfo },
        uiDialogs: { isOpen: stores.uiDialogs.isOpen },
        walletSettings: {
          getConceptualWalletSettingsCache: stores.walletSettings.getConceptualWalletSettingsCache,
        },
        wallets: {
          restoreRequest: {
            isExecuting: stores.wallets.restoreRequest.isExecuting,
            error: stores.wallets.restoreRequest.error,
            reset: stores.wallets.restoreRequest.reset,
          },
          publicDerivers: stores.wallets.publicDerivers,
        },
        walletRestore: {
          step: stores.walletRestore.step,
          duplicatedWallet: stores.walletRestore.duplicatedWallet,
          recoveryResult: stores.walletRestore.recoveryResult,
          walletRestoreMeta: stores.walletRestore.walletRestoreMeta,
          isValidMnemonic: stores.walletRestore.isValidMnemonic,
          getMode: stores.walletRestore.getMode,
        },
      },
      actions: {
        dialogs: {
          closeActiveDialog: { trigger: actions.dialogs.closeActiveDialog.trigger },
          open: { trigger: actions.dialogs.open.trigger },
        },
        wallets: {
          setActiveWallet: { trigger: actions.wallets.setActiveWallet.trigger },
        },
        walletRestore: {
          reset: { trigger: actions.walletRestore.reset.trigger },
          setMode: { trigger: actions.walletRestore.setMode.trigger },
          back: { trigger: actions.walletRestore.back.trigger },
          verifyMnemonic: { trigger: actions.walletRestore.verifyMnemonic.trigger },
          startRestore: { trigger: actions.walletRestore.startRestore.trigger },
          startCheck: { trigger: actions.walletRestore.startCheck.trigger },
          submitFields: { trigger: actions.walletRestore.submitFields.trigger },
        },
        profile: {
          setSelectedNetwork: { trigger: actions.profile.setSelectedNetwork.trigger },
        },
        ada: {
          wallets: {
            createWallet: {
              trigger: actions.ada.wallets.createWallet.trigger,
            },
          },
        },
        router: {
          goToRoute: { trigger: actions.router.goToRoute.trigger },
        },
      },
    });
  }
}
