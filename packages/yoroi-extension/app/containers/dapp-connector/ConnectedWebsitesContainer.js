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
import { getReceiveAddress } from '../../stores/stateless/addressStores';
import { withLayout } from '../../styles/context/layout'
import type { LayoutComponentMap } from '../../styles/context/layout'
import SidebarContainer from '../SidebarContainer'
import ConnectedWebsitesPage from '../../components/dapp-connector/ConnectedWebsites/ConnectedWebsitesPage'
import DappConnectorNavbar from '../../components/dapp-connector/Layout/DappConnectorNavbar'
import { genLookupOrFail } from '../../stores/stateless/tokenHelpers'
import LoadingSpinner from '../../components/widgets/LoadingSpinner'
import { LoadingWalletStates } from '../../ergo-connector/types'
import FullscreenLayout from '../../components/layout/FullscreenLayout'
import VerticallyCenteredLayout from '../../components/layout/VerticallyCenteredLayout'

export type GeneratedData = typeof MyWalletsPage.prototype.generated;

type Props = InjectedOrGenerated<GeneratedData>

type InjectedProps = {| +renderLayoutComponent: LayoutComponentMap => Node |};
type AllProps = {| ...Props, ...InjectedProps |};

@observer
class MyWalletsPage extends Component<AllProps> {

  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  async componentDidMount() {
    this.generated.actions.connector.refreshWallets.trigger();
    this.generated.actions.connector.refreshActiveSites.trigger();
    await this.generated.actions.connector.getConnectorWhitelist.trigger();
  }

  render (): Node {
    const { intl } = this.context;
    const { stores } = this.generated;
    const sidebarContainer = <SidebarContainer {...this.generated.SidebarContainerProps} />
    const wallets = this.generated.stores.connector.wallets;
    const loadingWallets = this.generated.stores.connector.loadingWallets;
    const error = this.generated.stores.connector.errorWallets;
    const isLoading = (
      loadingWallets === LoadingWalletStates.IDLE || loadingWallets === LoadingWalletStates.PENDING
    );
    const isSuccess = loadingWallets === LoadingWalletStates.SUCCESS;
    const isError = loadingWallets === LoadingWalletStates.REJECTED;

    let componentToRender;
    if (isLoading) {
      componentToRender =  (
        <FullscreenLayout bottomPadding={0}>
          <VerticallyCenteredLayout>
            <LoadingSpinner />
          </VerticallyCenteredLayout>
        </FullscreenLayout>
      );
    }
    if (isError) {
      componentToRender = <p>{error}</p>;
    }

    if (isSuccess) {
      componentToRender =  (
        <ConnectedWebsitesPage
          whitelistEntries={[] || this.generated.stores.connector.currentConnectorWhitelist}
          wallets={wallets}
          onRemoveWallet={this.onRemoveWallet}
          activeSites={this.generated.stores.connector.activeSites.sites}
          getTokenInfo={genLookupOrFail(this.generated.stores.tokenInfoStore.tokenInfo)}
          shouldHideBalance={this.generated.stores.profile.shouldHideBalance}
        />)
    }

    return (
      <TopBarLayout
        banner={(<BannerContainer {...this.generated.BannerContainerProps} />)}
        sidebar={sidebarContainer}
        navbar={<DappConnectorNavbar />}
      >
        {componentToRender}
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
        profile: {
          shouldHideBalance: stores.profile.shouldHideBalance,
        },
        connector: {
          wallets: stores.connector.wallets,
          currentConnectorWhitelist: stores.connector.currentConnectorWhitelist,
          loadingWallets: stores.connector.loadingWallets,
          errorWallets: stores.connector.errorWallets,
          activeSites: stores.connector.activeSites,
        },
        tokenInfoStore: {
          tokenInfo: stores.tokenInfoStore.tokenInfo,
        },
      },
      actions: {
        connector: {
          refreshWallets: { trigger: actions.connector.refreshWallets.trigger },
          refreshActiveSites: { trigger: actions.connector.refreshActiveSites.trigger },
          removeWalletFromWhitelist: {
            trigger: actions.connector.removeWalletFromWhitelist.trigger,
          },
          getConnectorWhitelist: { trigger: actions.connector.getConnectorWhitelist.trigger },
        },
      },
      SidebarContainerProps: (
        { actions, stores }: InjectedOrGenerated<SidebarContainerData>
      ),
      BannerContainerProps: ({ actions, stores }: InjectedOrGenerated<BannerContainerData>),
    });
  }
}
export default (withLayout(MyWalletsPage): ComponentType<Props>);