// @flow
import type { Node } from 'react';
import type { GeneratedData as BannerContainerData } from '../../banners/BannerContainer';
import type { GeneratedData as SidebarContainerData } from '../../SidebarContainer';
import type { InjectedOrGenerated } from '../../../types/injectedPropsType';
import type { NetworkRow } from '../../../api/ada/lib/storage/database/primitives/tables';
import type { ConceptualWalletSettingsCache } from '../../../stores/toplevel/WalletSettingsStore';
import type { ConceptualWallet } from '../../../api/ada/lib/storage/models/ConceptualWallet';
import type { TokenInfoMap } from '../../../stores/toplevel/TokenInfoStore';
import type { TxRequests } from '../../../stores/toplevel/TransactionsStore';
import type { PublicKeyCache } from '../../../stores/toplevel/WalletStore';
import type { IGetPublic } from '../../../api/ada/lib/storage/models/PublicDeriver/interfaces';
import type { UnitOfAccountSettingType } from '../../../types/unitOfAccountType';
import type {
  WalletRestoreMeta,
  RestoreModeType,
} from '../../../actions/common/wallet-restore-actions';
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
          restoreWallet={actions.walletRestore.restoreWallet.trigger}
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
        setMode: {| trigger: (params: RestoreModeType) => void |},
        restoreWallet: {| trigger: (params: WalletRestoreMeta) => Promise<void> |},
      |},
      profile: {|
        setSelectedNetwork: {| trigger: (params: void | $ReadOnly<NetworkRow>) => void |},
        updateHideBalance: {| trigger: (params: void) => Promise<void> |},
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
      profile: {|
        selectedNetwork: void | $ReadOnly<NetworkRow>,
        unitOfAccount: UnitOfAccountSettingType,
        shouldHideBalance: boolean,
      |},
      transactions: {| getTxRequests: (PublicDeriver<>) => TxRequests |},
      tokenInfoStore: {| tokenInfo: TokenInfoMap |},
      uiDialogs: {| isOpen: any => boolean |},
      walletRestore: {|
        isValidMnemonic: ({| mnemonic: string, mode: RestoreModeType |}) => boolean,
        selectedAccount: number,
        mode: void | RestoreModeType,
      |},
      wallets: {|
        restoreRequest: {| error: ?LocalizableError, isExecuting: boolean, reset: () => void |},
        publicDerivers: Array<PublicDeriver<>>,
        getPublicKeyCache: IGetPublic => PublicKeyCache,
      |},
      walletSettings: {|
        getConceptualWalletSettingsCache: ConceptualWallet => ConceptualWalletSettingsCache,
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
        profile: {
          selectedNetwork: stores.profile.selectedNetwork,
          unitOfAccount: stores.profile.unitOfAccount,
          shouldHideBalance: stores.profile.shouldHideBalance,
        },
        tokenInfoStore: { tokenInfo: stores.tokenInfoStore.tokenInfo },
        uiDialogs: { isOpen: stores.uiDialogs.isOpen },
        walletSettings: {
          getConceptualWalletSettingsCache: stores.walletSettings.getConceptualWalletSettingsCache,
        },
        transactions: { getTxRequests: stores.transactions.getTxRequests },
        wallets: {
          restoreRequest: {
            isExecuting: stores.wallets.restoreRequest.isExecuting,
            error: stores.wallets.restoreRequest.error,
            reset: stores.wallets.restoreRequest.reset,
          },
          getPublicKeyCache: stores.wallets.getPublicKeyCache,
          publicDerivers: stores.wallets.publicDerivers,
        },
        walletRestore: {
          isValidMnemonic: stores.walletRestore.isValidMnemonic,
          selectedAccount: stores.walletRestore.selectedAccount,
          mode: stores.walletRestore.mode,
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
          setMode: { trigger: actions.walletRestore.setMode.trigger },
          restoreWallet: { trigger: actions.walletRestore.restoreWallet.trigger },
        },
        profile: {
          setSelectedNetwork: { trigger: actions.profile.setSelectedNetwork.trigger },
          updateHideBalance: { trigger: actions.profile.updateHideBalance.trigger },
        },
        router: {
          goToRoute: { trigger: actions.router.goToRoute.trigger },
        },
      },
    });
  }
}
