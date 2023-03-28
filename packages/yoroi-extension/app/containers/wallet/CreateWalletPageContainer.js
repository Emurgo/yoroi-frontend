// @flow
import React, { Component, Suspense } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import { computed } from 'mobx';
import TopBarLayout from '../../components/layout/TopBarLayout';
import BannerContainer from '../banners/BannerContainer';
import type { GeneratedData as BannerContainerData } from '../banners/BannerContainer';
import SidebarContainer from '../SidebarContainer';
import type { GeneratedData as SidebarContainerData } from '../SidebarContainer';
import type { InjectedOrGenerated } from '../../types/injectedPropsType';
import type { NetworkRow } from '../../api/ada/lib/storage/database/primitives/tables';

export const CreateWalletPagePromise: void => Promise<any> = () =>
  import('../../components/wallet/create-wallet/CreateWalletPage');
const CreateWalletPage = React.lazy(CreateWalletPagePromise);

export type GeneratedData = typeof CreateWalletPageContainer.prototype.generated;
type Props = InjectedOrGenerated<GeneratedData>;

@observer
export default class CreateWalletPageContainer extends Component<Props> {
  render(): Node {
    const { stores, actions } = this.generated;

    return (
      <TopBarLayout
        banner={<BannerContainer {...this.generated.BannerContainerProps} />}
        sidebar={<SidebarContainer {...this.generated.SidebarContainerProps} />}
      >
        <Suspense fallback={null}>
          <CreateWalletPage
            genWalletRecoveryPhrase={stores.substores.ada.wallets.genWalletRecoveryPhrase}
            createWallet={actions.ada.wallets.createWallet.trigger}
            setSelectedNetwork={actions.profile.setSelectedNetwork.trigger}
            openDialog={dialog => this.generated.actions.dialogs.open.trigger({ dialog })}
            closeDialog={this.generated.actions.dialogs.closeActiveDialog.trigger}
            isDialogOpen={stores.uiDialogs.isOpen}
          />
        </Suspense>
      </TopBarLayout>
    );
  }

  @computed get generated(): {|
    BannerContainerProps: InjectedOrGenerated<BannerContainerData>,
    SidebarContainerProps: InjectedOrGenerated<SidebarContainerData>,
    actions: {|
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
        setSelectedNetwork: {|
          trigger: (params: void | $ReadOnly<NetworkRow>) => void,
        |},
      |},
    |},
    stores: {|
      substores: {|
        ada: {|
          wallets: {|
            genWalletRecoveryPhrase: void => Promise<Array<string>>,
          |},
        |},
      |},
      uiDialogs: {|
        isOpen: any => boolean,
      |},
    |},
  |} {
    if (this.props.generated !== undefined) {
      return this.props.generated;
    }
    if (this.props.stores == null || this.props.actions == null) {
      throw new Error(`${nameof(CreateWalletPageContainer)} no way to generated props`);
    }
    const { stores, actions } = this.props;
    return Object.freeze({
      stores: {
        substores: {
          ada: {
            wallets: {
              genWalletRecoveryPhrase: stores.substores.ada.wallets.genWalletRecoveryPhrase,
            },
          },
        },
        uiDialogs: {
          isOpen: stores.uiDialogs.isOpen,
        },
      },
      actions: {
        ada: {
          wallets: {
            createWallet: {
              trigger: actions.ada.wallets.createWallet.trigger,
            },
          },
        },
        profile: {
          setSelectedNetwork: {
            trigger: actions.profile.setSelectedNetwork.trigger,
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
      },
      BannerContainerProps: ({ actions, stores }: InjectedOrGenerated<BannerContainerData>),
      SidebarContainerProps: ({ actions, stores }: InjectedOrGenerated<SidebarContainerData>),
    });
  }
}
