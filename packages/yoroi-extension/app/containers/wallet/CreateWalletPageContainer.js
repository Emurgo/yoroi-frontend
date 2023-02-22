
// @flow
import { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import { computed } from 'mobx';
import TopBarLayout from '../../components/layout/TopBarLayout';
import BannerContainer from '../banners/BannerContainer';
import type { GeneratedData as BannerContainerData } from '../banners/BannerContainer';
import SidebarContainer from '../SidebarContainer';
import type { GeneratedData as SidebarContainerData } from '../SidebarContainer';
import CreateWalletPage from '../../components/wallet/create-wallet/CreateWalletPage';
import type { InjectedOrGenerated } from '../../types/injectedPropsType';

export type GeneratedData = typeof CreateWalletPageContainer.prototype.generated;
type Props = InjectedOrGenerated<GeneratedData>;

@observer
export default class CreateWalletPageContainer extends Component<Props> {

  openDialog: Node => void = dialog => {
    this.generated.actions.dialogs.open.trigger({ dialog });
  }

  render(): Node {
    const { stores, actions } = this.generated;
    return (
      <TopBarLayout
        banner={(<BannerContainer {...this.generated.BannerContainerProps} />)}
        sidebar={<SidebarContainer {...this.generated.SidebarContainerProps} />}
      >
        <CreateWalletPage
          openDialog={this.openDialog}
          closeDialog={actions.dialogs.closeActiveDialog.trigger}
          isDialogOpen={stores.uiDialogs.isOpen}
        />
      </TopBarLayout>
    );
  }

  @computed get generated(): {|
    BannerContainerProps: InjectedOrGenerated<BannerContainerData>,
    SidebarContainerProps: InjectedOrGenerated<SidebarContainerData>,
    actions: {|
      dialogs: {|
        open: {|
          trigger: (params: {|
            dialog: any,
            params?: any,
          |}) => void,
        |},
        closeActiveDialog: {|
          trigger: (params: void) => void
        |}
      |},
    |},
    stores: {|
      uiDialogs: {|
        isOpen: any => boolean
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
        uiDialogs: {
          isOpen: stores.uiDialogs.isOpen,
        }
      },
      actions: {
        dialogs: {
          open: { trigger: actions.dialogs.open.trigger },
          closeActiveDialog: { trigger: actions.dialogs.closeActiveDialog.trigger },
        },
      },
      BannerContainerProps: ({ actions, stores }: InjectedOrGenerated<BannerContainerData>),
      SidebarContainerProps: (
        { actions, stores, }: InjectedOrGenerated<SidebarContainerData>
      ),
    });
  }
}