// @flow
import { Component, cloneElement } from 'react';
import type { Node, ComponentType } from 'react';
import { observer } from 'mobx-react';
import { intlShape } from 'react-intl';
import globalMessages from '../../i18n/global-messages';
import SettingsLayout from '../../components/settings/SettingsLayout';
import { buildRoute } from '../../utils/routing';
import type { StoresAndActionsProps } from '../../types/injectedProps.types';

import TopBarLayout from '../../components/layout/TopBarLayout';
import NavBarTitle from '../../components/topbar/NavBarTitle';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { withLayout, type LayoutComponentMap } from '../../styles/context/layout';
import PortfolioMenu from '../features/portfolio/common/PortfolioMenu';
import NavBarContainer from '../../containers/NavBarContainer';
import BannerContainer from '../../containers/banners/BannerContainer';
import SidebarContainer from '../../containers/SidebarContainer';
import NavBarContainerRevamp from '../../containers/NavBarContainerRevamp';
import { ROUTES } from '../../routes-config';
import { IntlProvider } from '../context/IntlProvider';

type Props = {|
  ...StoresAndActionsProps,
  +children?: Node,
|};
type InjectedLayoutProps = {|
  +renderLayoutComponent: LayoutComponentMap => Node,
|};

type AllProps = {| ...Props, ...InjectedLayoutProps |};
@observer
class PortfolioPageLayout extends Component<AllProps> {
  static defaultProps: {| children: void |} = {
    children: undefined,
  };

  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  isActivePage: string => boolean = route => {
    const { location } = this.props.stores.router;
    if (route && location) {
      return location.pathname === buildRoute(route);
    }
    return false;
  };

  render(): Node {
    const { location } = this.props.stores.router;
    const isDetailPage = location.pathname.startsWith(`${ROUTES.PORTFOLIO.ROOT}/details`);
    const { actions, stores } = this.props;
    const { children } = this.props;
    const { intl } = this.context;
    const sidebarContainer = <SidebarContainer actions={actions} stores={stores} />;

    const menu = isDetailPage ? null : (
      <PortfolioMenu onItemClick={route => actions.router.goToRoute.trigger({ route })} isActiveItem={this.isActivePage} />
    );

    const PortfolioLayoutClassic = (
      <IntlProvider intl={intl}>
        <TopBarLayout
          banner={<BannerContainer actions={actions} stores={stores} />}
          sidebar={sidebarContainer}
          navbar={
            <NavBarContainer
              actions={actions}
              stores={stores}
              title={
                <NavBarTitle
                  title={intl.formatMessage(
                    isDetailPage ? globalMessages.portfolioDetailHeaderText : globalMessages.portfolioHeaderText
                  )}
                />
              }
            />
          }
          showInContainer
          showAsCard
        >
          <SettingsLayout menu={menu}>{children}</SettingsLayout>
        </TopBarLayout>
      </IntlProvider>
    );
    const PortfolioLayoutRevamp = (
      <IntlProvider intl={intl}>
        <TopBarLayout
          banner={<BannerContainer actions={actions} stores={stores} />}
          sidebar={sidebarContainer}
          navbar={
            <NavBarContainerRevamp
              actions={actions}
              stores={stores}
              title={
                <NavBarTitle
                  title={intl.formatMessage(
                    isDetailPage ? globalMessages.portfolioDetailHeaderText : globalMessages.portfolioHeaderText
                  )}
                />
              }
              menu={menu}
            />
          }
          showInContainer
          showAsCard
        >
          {children}
        </TopBarLayout>
      </IntlProvider>
    );
    return this.props.renderLayoutComponent({
      CLASSIC: PortfolioLayoutClassic,
      REVAMP: PortfolioLayoutRevamp,
    });
  }
}
export default (withLayout(PortfolioPageLayout): ComponentType<Props>);
