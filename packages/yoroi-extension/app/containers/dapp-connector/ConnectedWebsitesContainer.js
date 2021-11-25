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
import { ConceptualWallet } from '../../api/ada/lib/storage/models/ConceptualWallet'
import type { ConceptualWalletSettingsCache } from '../../stores/toplevel/WalletSettingsStore';
import type { TokenInfoMap } from '../../stores/toplevel/TokenInfoStore';
import type { WhitelistEntry , PublicDeriverCache } from '../../../chrome/extension/ergo-connector/types'
import { PublicDeriver } from '../../api/ada/lib/storage/models/PublicDeriver'
import environment from '../../environment'
import { ROUTES } from '../../routes-config'

export type GeneratedData = typeof ConnectedWebsitesPageContainer.prototype.generated;

type Props = InjectedOrGenerated<GeneratedData>

type InjectedProps = {| +renderLayoutComponent: LayoutComponentMap => Node |};
type AllProps = {| ...Props, ...InjectedProps |};

@observer
class ConnectedWebsitesPageContainer extends Component<AllProps> {

  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  async componentDidMount() {
    // User should not be able to access the route when using Yoroi Light
    if(environment.isLight) {
      this.generated.actions.router.goToRoute.trigger({
        route: ROUTES.WALLETS.DELEGATION_DASHBOARD
      })
    }
    this.generated.actions.connector.refreshWallets.trigger();
    this.generated.actions.connector.refreshActiveSites.trigger();
    await this.generated.actions.connector.getConnectorWhitelist.trigger();
  }

  onRemoveWallet: ?string => void = url => {
    if (url == null) {
      throw new Error(`Removing a wallet from whitelist but there's no url`);
    }
    this.generated.actions.connector.removeWalletFromWhitelist.trigger(url);
  };
  getConceptualWallet(publicDeriverId: number): ConceptualWalletSettingsCache | null {
    const wallets = this.generated.stores.wallets.publicDerivers;
    const wallet = wallets.find(
      publicDeriver => publicDeriver.getPublicDeriverId() === publicDeriverId
    )

    if(!wallet) return null
    const settingsCache = this.generated.stores.walletSettings
    .getConceptualWalletSettingsCache(wallet.getParent());

    return settingsCache
  }

  render (): Node {
    const { stores } = this.generated;
    const sidebarContainer = <SidebarContainer {...this.generated.SidebarContainerProps} />
    const wallets = stores.connector.allWallets;
    const loadingWallets = stores.connector.loadingWallets;
    const error = stores.connector.errorWallets;
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
      componentToRender = <p>{error}</p>
    }
    if (isSuccess) {
      componentToRender =  (
        <ConnectedWebsitesPage
          whitelistEntries={this.generated.stores.connector.currentConnectorWhitelist}
          wallets={wallets}
          onRemoveWallet={this.onRemoveWallet}
          activeSites={this.generated.stores.connector.activeSites.sites}
          getTokenInfo={genLookupOrFail(this.generated.stores.tokenInfoStore.tokenInfo)}
          shouldHideBalance={this.generated.stores.profile.shouldHideBalance}
          getConceptualWallet={this.getConceptualWallet.bind(this)}
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
      connector: {|
        refreshWallets: {|
          trigger: (params: void) => Promise<void>,
        |},
        refreshActiveSites: {|
          trigger: (params: void) => Promise<void>,
        |},
        removeWalletFromWhitelist: {|
          trigger: (params: string) => Promise<void>,
        |},
        getConnectorWhitelist: {|
          trigger: (params: void) => Promise<void>,
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
    |},
    stores: {|
      profile: {|
        shouldHideBalance: boolean,
      |},
      connector: {|
        allWallets: Array<PublicDeriverCache>,
        currentConnectorWhitelist: Array<WhitelistEntry>,
        errorWallets: string,
        loadingWallets: $Values<typeof LoadingWalletStates>,
        activeSites: {| sites: Array<string> |},
      |},
      walletSettings: {|
        getConceptualWalletSettingsCache: ConceptualWallet => ConceptualWalletSettingsCache
      |},
      tokenInfoStore: {|
        tokenInfo: TokenInfoMap,
      |},
      wallets: {|
        publicDerivers: Array<PublicDeriver<>>,
      |}
    |},
    getReceiveAddress: typeof getReceiveAddress,
    |} {
    if (this.props.generated !== undefined) {
      return this.props.generated;
    }
    if (this.props.stores == null || this.props.actions == null) {
      throw new Error(`${nameof(ConnectedWebsitesPage)} no way to generated props`);
    }
    const { stores, actions } = this.props;
    return Object.freeze({
      // make this function easy to mock out in Storybook
      getReceiveAddress,
      stores: {
        profile: {
          shouldHideBalance: stores.profile.shouldHideBalance,
        },
        walletSettings: {
          getConceptualWalletSettingsCache: stores.walletSettings
            .getConceptualWalletSettingsCache,
        },
        wallets: {
          publicDerivers: stores.wallets.publicDerivers,
        },
        connector: {
          allWallets: stores.connector.allWallets,
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
        router: {
          goToRoute: { trigger: actions.router.goToRoute.trigger },
        },
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
export default (withLayout(ConnectedWebsitesPageContainer): ComponentType<Props>);