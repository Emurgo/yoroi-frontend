// @flow
import type { Node } from 'react';
import { Component, lazy, Suspense } from 'react';
import { observer } from 'mobx-react';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { intlShape } from 'react-intl';
import type { StoresAndActionsProps } from '../../types/injectedProps.types';
import TopBarLayout from '../../components/layout/TopBarLayout';
import BannerContainer from '../banners/BannerContainer';
import SidebarContainer from '../SidebarContainer';
import { genLookupOrFail } from '../../stores/stateless/tokenHelpers';
import FullscreenLayout from '../../components/layout/FullscreenLayout';
import environment from '../../environment';
import { ROUTES } from '../../routes-config';
import NavBarContainerRevamp from '../NavBarContainerRevamp';
import NavBarTitle from '../../components/topbar/NavBarTitle';
import { connectorMessages } from '../../i18n/global-messages';

export const ConnectedWebsitesPagePromise: void => Promise<any> = () =>
  import('../../components/dapp-connector/ConnectedWebsites/ConnectedWebsitesPage');
const ConnectedWebsitesPage = lazy(ConnectedWebsitesPagePromise);

@observer
export default class ConnectedWebsitesPageContainer extends Component<StoresAndActionsProps> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  async componentDidMount() {
    // User should not be able to access the route when using Yoroi Light
    if (environment.isLight) {
      this.props.stores.app.goToRoute({
        route: ROUTES.MY_WALLETS,
      });
    }
    await this.props.stores.connector.refreshActiveSites();
    await this.props.stores.connector.getConnectorWhitelist();
  }

  onRemoveWallet: ({| url: ?string |}) => void = ({ url }) => {
    if (url == null) {
      throw new Error(`Removing a wallet from whitelist but there's no url or protocol`);
    }
    // noinspection JSIgnoredPromiseFromCall
    this.props.stores.connector.removeWalletFromWhitelist1({
      url,
    });
  };

  render(): Node {
    const { stores } = this.props;
    const sidebarContainer = <SidebarContainer stores={stores} />;
    const wallets = this.props.stores.wallets.wallets;
    const { intl } = this.context;

    return (
      <TopBarLayout
        banner={<BannerContainer stores={stores} />}
        sidebar={sidebarContainer}
        navbar={
          <NavBarContainerRevamp
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
            />
          </Suspense>
        </FullscreenLayout>
      </TopBarLayout>
    );
  }
}
