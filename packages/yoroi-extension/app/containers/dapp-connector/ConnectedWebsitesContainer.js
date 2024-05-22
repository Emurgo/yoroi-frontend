// @flow
import type { Node, ComponentType } from 'react';
import { Component, lazy, Suspense } from 'react';
import { observer } from 'mobx-react';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { intlShape } from 'react-intl';
import type { StoresAndActionsProps } from '../../types/injectedProps.types';
import TopBarLayout from '../../components/layout/TopBarLayout';
import BannerContainer from '../banners/BannerContainer';
import { withLayout } from '../../styles/context/layout';
import type { LayoutComponentMap } from '../../styles/context/layout';
import SidebarContainer from '../SidebarContainer';
import { genLookupOrFail } from '../../stores/stateless/tokenHelpers';
import FullscreenLayout from '../../components/layout/FullscreenLayout';
import type { ConceptualWalletSettingsCache } from '../../stores/toplevel/WalletSettingsStore';
import { PublicDeriver } from '../../api/ada/lib/storage/models/PublicDeriver';
import { asGetPublicKey } from '../../api/ada/lib/storage/models/PublicDeriver/traits';
import environment from '../../environment';
import { ROUTES } from '../../routes-config';
import type { WalletChecksum } from '@emurgo/cip4-js';
import type { MultiToken } from '../../api/common/lib/MultiToken';
import NavBarContainerRevamp from '../NavBarContainerRevamp';
import NavBarTitle from '../../components/topbar/NavBarTitle';
import { connectorMessages } from '../../i18n/global-messages';

export const ConnectedWebsitesPagePromise: void => Promise<any> = () =>
  import('../../components/dapp-connector/ConnectedWebsites/ConnectedWebsitesPage');
const ConnectedWebsitesPage = lazy(ConnectedWebsitesPagePromise);

type Props = StoresAndActionsProps;

type InjectedLayoutProps = {| +renderLayoutComponent: LayoutComponentMap => Node |};
type AllProps = {| ...Props, ...InjectedLayoutProps |};

@observer
class ConnectedWebsitesPageContainer extends Component<AllProps> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  async componentDidMount() {
    // User should not be able to access the route when using Yoroi Light
    if (environment.isLight) {
      this.props.actions.router.goToRoute.trigger({
        route: ROUTES.MY_WALLETS,
      });
    }
    this.props.actions.connector.refreshActiveSites.trigger();
    await this.props.actions.connector.getConnectorWhitelist.trigger();
  }

  onRemoveWallet: ({| url: ?string, protocol: ?string |}) => void = ({ url, protocol }) => {
    if (url == null || protocol == null) {
      throw new Error(`Removing a wallet from whitelist but there's no url or protocol`);
    }
    this.props.actions.connector.removeWalletFromWhitelist.trigger({
      url,
      protocol,
    });
  };

  getConceptualWallet(publicDeriver: PublicDeriver<>): ConceptualWalletSettingsCache {
    const settingsCache = this.props.stores.walletSettings.getConceptualWalletSettingsCache(
      publicDeriver.getParent()
    );

    return settingsCache;
  }

  getWalletInfo(
    publicDeriver: PublicDeriver<>
  ): {| balance: null | MultiToken, plate: null | WalletChecksum |} {
    const balance = this.props.stores.transactions.getBalance(publicDeriver);

    const withPubKey = asGetPublicKey(publicDeriver);
    const plate =
      withPubKey == null ? null : this.props.stores.wallets.getPublicKeyCache(withPubKey).plate;

    return {
      balance,
      plate,
    };
  }

  render(): Node {
    const { actions, stores } = this.props;
    const sidebarContainer = <SidebarContainer actions={actions} stores={stores} />;
    const wallets = this.props.stores.wallets.publicDerivers;
    const { intl } = this.context;

    return (
      <TopBarLayout
        banner={<BannerContainer actions={actions} stores={stores} />}
        sidebar={sidebarContainer}
        navbar={
          <NavBarContainerRevamp
            actions={actions}
            stores={stores}
            title={<NavBarTitle title={intl.formatMessage(connectorMessages.dappConnector)} />}
          />
        }
      >
        <FullscreenLayout bottomPadding={0}>
          <Suspense fallback={null}>
            <ConnectedWebsitesPage
              whitelistEntries={this.props.stores.connector.currentConnectorWhitelist}
              wallets={wallets}
              onRemoveWallet={this.onRemoveWallet}
              activeSites={this.props.stores.connector.activeSites.sites}
              getTokenInfo={genLookupOrFail(this.props.stores.tokenInfoStore.tokenInfo)}
              shouldHideBalance={this.props.stores.profile.shouldHideBalance}
              getConceptualWallet={this.getConceptualWallet.bind(this)}
              getWalletInfo={this.getWalletInfo.bind(this)}
            />
          </Suspense>
        </FullscreenLayout>
      </TopBarLayout>
    );
  }
}
export default (withLayout(ConnectedWebsitesPageContainer): ComponentType<Props>);
