// @flow
import type { Node, ComponentType } from 'react';
import { Component, lazy, Suspense } from 'react';
import { computed } from 'mobx';
import { observer } from 'mobx-react';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { intlShape } from 'react-intl';
import type { InjectedOrGenerated } from '../../types/injectedPropsType';
import TopBarLayout from '../../components/layout/TopBarLayout';
import type { GeneratedData as SidebarContainerData } from '../SidebarContainer';
import type { GeneratedData as BannerContainerData } from '../banners/BannerContainer';
import BannerContainer from '../banners/BannerContainer';
import { getReceiveAddress } from '../../stores/stateless/addressStores';
import { withLayout } from '../../styles/context/layout';
import type { LayoutComponentMap } from '../../styles/context/layout';
import SidebarContainer from '../SidebarContainer';
import type { GeneratedData as NavBarContainerRevampData } from '../NavBarContainerRevamp';
import { genLookupOrFail } from '../../stores/stateless/tokenHelpers';
import FullscreenLayout from '../../components/layout/FullscreenLayout';
import { ConceptualWallet } from '../../api/ada/lib/storage/models/ConceptualWallet';
import type { ConceptualWalletSettingsCache } from '../../stores/toplevel/WalletSettingsStore';
import type { TokenInfoMap } from '../../stores/toplevel/TokenInfoStore';
import type { WhitelistEntry } from '../../../chrome/extension/connector/types';
import { PublicDeriver } from '../../api/ada/lib/storage/models/PublicDeriver';
import { asGetPublicKey } from '../../api/ada/lib/storage/models/PublicDeriver/traits';
import environment from '../../environment';
import { ROUTES } from '../../routes-config';
import type { TxRequests } from '../../stores/toplevel/TransactionsStore';
import type { PublicKeyCache } from '../../stores/toplevel/WalletStore';
import type { IGetPublic } from '../../api/ada/lib/storage/models/PublicDeriver/interfaces';
import type { WalletChecksum } from '@emurgo/cip4-js';
import type { MultiToken } from '../../api/common/lib/MultiToken';
import NavBarContainerRevamp from '../NavBarContainerRevamp';
import NavBarTitle from '../../components/topbar/NavBarTitle';
import { connectorMessages } from '../../i18n/global-messages';

export const ConnectedWebsitesPagePromise: void => Promise<any> = () =>
  import('../../components/dapp-connector/ConnectedWebsites/ConnectedWebsitesPage');
const ConnectedWebsitesPage = lazy(ConnectedWebsitesPagePromise);

export type GeneratedData = typeof ConnectedWebsitesPageContainer.prototype.generated;

type Props = InjectedOrGenerated<GeneratedData>;

type InjectedProps = {| +renderLayoutComponent: LayoutComponentMap => Node |};
type AllProps = {| ...Props, ...InjectedProps |};

@observer
class ConnectedWebsitesPageContainer extends Component<AllProps> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  async componentDidMount() {
    // User should not be able to access the route when using Yoroi Light
    if (environment.isLight) {
      this.generated.actions.router.goToRoute.trigger({
        route: ROUTES.MY_WALLETS,
      });
    }
    this.generated.actions.connector.refreshActiveSites.trigger();
    await this.generated.actions.connector.getConnectorWhitelist.trigger();
  }

  onRemoveWallet: ({| url: ?string, protocol: ?string |}) => void = ({ url, protocol }) => {
    if (url == null || protocol == null) {
      throw new Error(`Removing a wallet from whitelist but there's no url or protocol`);
    }
    this.generated.actions.connector.removeWalletFromWhitelist.trigger({
      url,
      protocol,
    });
  };

  getConceptualWallet(publicDeriver: PublicDeriver<>): ConceptualWalletSettingsCache {
    const settingsCache = this.generated.stores.walletSettings.getConceptualWalletSettingsCache(
      publicDeriver.getParent()
    );

    return settingsCache;
  }

  getWalletInfo(
    publicDeriver: PublicDeriver<>
  ): {| balance: null | MultiToken, plate: null | WalletChecksum |} {
    const txRequests: TxRequests = this.generated.stores.transactions.getTxRequests(publicDeriver);
    const balance = txRequests.requests.getBalanceRequest.result ?? null;

    const withPubKey = asGetPublicKey(publicDeriver);
    const plate =
      withPubKey == null ? null : this.generated.stores.wallets.getPublicKeyCache(withPubKey).plate;

    return {
      balance,
      plate,
    };
  }

  render(): Node {
    const sidebarContainer = <SidebarContainer {...this.generated.SidebarContainerProps} />;
    const wallets = this.generated.stores.wallets.publicDerivers;
    const { intl } = this.context;

    return (
      <TopBarLayout
        banner={<BannerContainer {...this.generated.BannerContainerProps} />}
        sidebar={sidebarContainer}
        navbar={
          <NavBarContainerRevamp
            {...this.generated.NavBarContainerRevampProps}
            title={<NavBarTitle title={intl.formatMessage(connectorMessages.dappConnector)} />}
          />
        }
      >
        <FullscreenLayout bottomPadding={0}>
          <Suspense fallback={null}>
            <ConnectedWebsitesPage
              whitelistEntries={this.generated.stores.connector.currentConnectorWhitelist}
              wallets={wallets}
              onRemoveWallet={this.onRemoveWallet}
              activeSites={this.generated.stores.connector.activeSites.sites}
              getTokenInfo={genLookupOrFail(this.generated.stores.tokenInfoStore.tokenInfo)}
              shouldHideBalance={this.generated.stores.profile.shouldHideBalance}
              getConceptualWallet={this.getConceptualWallet.bind(this)}
              getWalletInfo={this.getWalletInfo.bind(this)}
            />
          </Suspense>
        </FullscreenLayout>
      </TopBarLayout>
    );
  }

  @computed get generated(): {|
    BannerContainerProps: InjectedOrGenerated<BannerContainerData>,
    SidebarContainerProps: InjectedOrGenerated<SidebarContainerData>,
    NavBarContainerRevampProps: InjectedOrGenerated<NavBarContainerRevampData>,
    actions: {|
      connector: {|
        refreshWallets: {|
          trigger: (params: void) => Promise<void>,
        |},
        refreshActiveSites: {|
          trigger: (params: void) => Promise<void>,
        |},
        removeWalletFromWhitelist: {|
          trigger: (params: {| url: string, protocol: string |}) => Promise<void>,
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
        currentConnectorWhitelist: Array<WhitelistEntry>,
        activeSites: {| sites: Array<string> |},
      |},
      walletSettings: {|
        getConceptualWalletSettingsCache: ConceptualWallet => ConceptualWalletSettingsCache,
      |},
      tokenInfoStore: {|
        tokenInfo: TokenInfoMap,
      |},
      wallets: {|
        getPublicKeyCache: IGetPublic => PublicKeyCache,
        publicDerivers: Array<PublicDeriver<>>,
      |},
      transactions: {|
        getTxRequests: (PublicDeriver<>) => TxRequests,
      |},
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
          getConceptualWalletSettingsCache: stores.walletSettings.getConceptualWalletSettingsCache,
        },
        wallets: {
          publicDerivers: stores.wallets.publicDerivers,
          getPublicKeyCache: stores.wallets.getPublicKeyCache,
        },
        transactions: {
          getTxRequests: stores.transactions.getTxRequests,
        },
        connector: {
          currentConnectorWhitelist: stores.connector.currentConnectorWhitelist,
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
      SidebarContainerProps: ({ actions, stores }: InjectedOrGenerated<SidebarContainerData>),
      BannerContainerProps: ({ actions, stores }: InjectedOrGenerated<BannerContainerData>),
      NavBarContainerRevampProps: ({
        actions,
        stores,
      }: InjectedOrGenerated<NavBarContainerRevampData>),
    });
  }
}
export default (withLayout(ConnectedWebsitesPageContainer): ComponentType<Props>);
