// @flow
import { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import { computed } from 'mobx';
import TopBarLayout from '../../../components/layout/TopBarLayout';
import BannerContainer from '../../banners/BannerContainer';
import type { GeneratedData as BannerContainerData } from '../../banners/BannerContainer';
import SidebarContainer from '../../SidebarContainer';
import type { GeneratedData as SidebarContainerData } from '../../SidebarContainer';
import CreateWalletPage from '../../../components/wallet/create-wallet/CreateWalletPage';
import type { InjectedOrGenerated } from '../../../types/injectedPropsType';
import RestoreWalletPageComponent from '../../../components/wallet/restore/RestoreWalletPage';

export type GeneratedData = typeof RestoreWalletPage.prototype.generated;
type Props = InjectedOrGenerated<GeneratedData>;

@observer
export default class RestoreWalletPage extends Component<Props> {
  render(): Node {
    const { stores } = this.generated;

    return (
      <TopBarLayout
        banner={<BannerContainer {...this.generated.BannerContainerProps} />}
        sidebar={<SidebarContainer {...this.generated.SidebarContainerProps} />}
      >
        <RestoreWalletPageComponent />
      </TopBarLayout>
    );
  }

  @computed get generated(): {|
    BannerContainerProps: InjectedOrGenerated<BannerContainerData>,
    SidebarContainerProps: InjectedOrGenerated<SidebarContainerData>,
    actions: {||},
    stores: {||},
  |} {
    if (this.props.generated !== undefined) {
      return this.props.generated;
    }
    if (this.props.stores == null || this.props.actions == null) {
      throw new Error(`${nameof(RestoreWalletPage)} no way to generated props`);
    }
    const { stores, actions } = this.props;
    return Object.freeze({
      stores: {},
      actions: {},
      BannerContainerProps: ({ actions, stores }: InjectedOrGenerated<BannerContainerData>),
      SidebarContainerProps: ({ actions, stores }: InjectedOrGenerated<SidebarContainerData>),
    });
  }
}
