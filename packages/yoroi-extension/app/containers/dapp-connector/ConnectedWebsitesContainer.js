// @flow
import type { Node, ComponentType } from 'react'
import { Component } from 'react'
import { computed } from 'mobx'
import { observer } from 'mobx-react'
import type { $npm$ReactIntl$IntlFormat } from 'react-intl'
import { intlShape, } from 'react-intl'
import type { InjectedOrGenerated } from '../../types/injectedPropsType'
import TopBarLayout from '../../components/layout/TopBarLayout'
import type { GeneratedData as SidebarContainerData } from '../SidebarContainer'
import type { GeneratedData as BannerContainerData } from '../banners/BannerContainer'
import BannerContainer from '../banners/BannerContainer'
import NavBarTitle from '../../components/topbar/NavBarTitle'
import globalMessages from '../../i18n/global-messages'
import { getReceiveAddress } from '../../stores/stateless/addressStores';
import { withLayout } from '../../styles/context/layout'
import type { LayoutComponentMap } from '../../styles/context/layout'
import SidebarContainer from '../SidebarContainer'

export type GeneratedData = typeof MyWalletsPage.prototype.generated;

type Props = InjectedOrGenerated<GeneratedData>

type InjectedProps = {| +renderLayoutComponent: LayoutComponentMap => Node |};
type AllProps = {| ...Props, ...InjectedProps |};

@observer
class MyWalletsPage extends Component<AllProps> {

  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  render (): Node {
    const { intl } = this.context;
    const { stores } = this.generated;
    const sidebarContainer = <SidebarContainer {...this.generated.SidebarContainerProps} />
    const navbar = (
      <div>
        <h1>DApp Connector</h1>
      </div>
    )

    return (
      <TopBarLayout
        banner={(<BannerContainer {...this.generated.BannerContainerProps} />)}
        sidebar={sidebarContainer}
        navbar={navbar}
      >
        <div>
          <h1>{JSON.stringify(this.generated.stores.connector.currentConnectorWhitelist)}</h1>
        </div>
      </TopBarLayout>
    );
  }


  @computed get generated (): {|
    BannerContainerProps: InjectedOrGenerated<BannerContainerData>,
    SidebarContainerProps: InjectedOrGenerated<SidebarContainerData>,
    actions: {|
    |},
    stores: {|
    |},
    getReceiveAddress: typeof getReceiveAddress,
    |} {
    if (this.props.generated !== undefined) {
      return this.props.generated;
    }
    if (this.props.stores == null || this.props.actions == null) {
      throw new Error(`${nameof(MyWalletsPage)} no way to generated props`);
    }
    const { stores, actions } = this.props;
    return Object.freeze({
      // make this function easy to mock out in Storybook
      getReceiveAddress,
      stores: {
        connector: {
          wallets: stores.connector.wallets,
          currentConnectorWhitelist: stores.connector.currentConnectorWhitelist,
          loadingWallets: stores.connector.loadingWallets,
          errorWallets: stores.connector.errorWallets,
          activeSites: stores.connector.activeSites,
        },
      },
      actions: {
      },
      SidebarContainerProps: (
        { actions, stores }: InjectedOrGenerated<SidebarContainerData>
      ),
      BannerContainerProps: ({ actions, stores }: InjectedOrGenerated<BannerContainerData>),
    });
  }
}
export default (withLayout(MyWalletsPage): ComponentType<Props>);