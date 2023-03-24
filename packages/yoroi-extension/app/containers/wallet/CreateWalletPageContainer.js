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

export const CreateWalletPagePromise: void => Promise<any> = () =>
  import('../../components/wallet/create-wallet/CreateWalletPage');
const CreateWalletPage = React.lazy(CreateWalletPagePromise);

export type GeneratedData = typeof CreateWalletPageContainer.prototype.generated;
type Props = InjectedOrGenerated<GeneratedData>;

@observer
export default class CreateWalletPageContainer extends Component<Props> {
  render(): Node {
    return (
      <TopBarLayout
        banner={<BannerContainer {...this.generated.BannerContainerProps} />}
        sidebar={<SidebarContainer {...this.generated.SidebarContainerProps} />}
      >
        <Suspense fallback={null}>
          <CreateWalletPage
            genWalletRecoveryPhrase={
              this.generated.stores.substores.ada.wallets.genWalletRecoveryPhrase
            }
          />
        </Suspense>
      </TopBarLayout>
    );
  }

  @computed get generated(): {|
    BannerContainerProps: InjectedOrGenerated<BannerContainerData>,
    SidebarContainerProps: InjectedOrGenerated<SidebarContainerData>,
    actions: {||},
    stores: {|
      wallets: {|
        genWalletRecoveryPhrase: void => Promise<Array<string>>,
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
      },
      actions: {},
      BannerContainerProps: ({ actions, stores }: InjectedOrGenerated<BannerContainerData>),
      SidebarContainerProps: ({ actions, stores }: InjectedOrGenerated<SidebarContainerData>),
    });
  }
}
