// @flow
import { Component } from 'react';
import type { Node, ComponentType } from 'react';
import { observer } from 'mobx-react';
import { intlShape } from 'react-intl';
import globalMessages from '../../i18n/global-messages';
import SettingsLayout from '../../components/settings/SettingsLayout';
import NavBarContainer from '../NavBarContainer';
import BannerContainer from '../banners/BannerContainer';
import { buildRoute } from '../../utils/routing';
import type { StoresAndActionsProps } from '../../types/injectedProps.types';

import TopBarLayout from '../../components/layout/TopBarLayout';
import SidebarContainer from '../SidebarContainer';
import NavBarTitle from '../../components/topbar/NavBarTitle';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { withLayout } from '../../styles/context/layout';
import type { LayoutComponentMap } from '../../styles/context/layout';
import NavBarContainerRevamp from '../NavBarContainerRevamp';
import PortfolioMenu from '../../components/portfolio/PortfolioMenu';
import { ROUTES } from '../../routes-config';

type Props = {|
  ...StoresAndActionsProps,
  +children?: Node,
|};
type InjectedLayoutProps = {|
  +renderLayoutComponent: LayoutComponentMap => Node,
|};

type AllProps = {| ...Props, ...InjectedLayoutProps |};
@observer
class PortfolioWrapper extends Component<AllProps> {
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
    const sidebarContainer = <SidebarContainer actions={actions} stores={stores} />;

    const menu = isDetailPage ? null : (
      <PortfolioMenu
        onItemClick={route => actions.router.goToRoute.trigger({ route })}
        isActiveItem={this.isActivePage}
      />
    );

    const PortfolioLayoutClassic = (
      <TopBarLayout
        banner={<BannerContainer actions={actions} stores={stores} />}
        sidebar={sidebarContainer}
        navbar={
          <NavBarContainer
            actions={actions}
            stores={stores}
            title={
              <NavBarTitle
                title={this.context.intl.formatMessage(
                  isDetailPage
                    ? globalMessages.portfolioDetailHeaderText
                    : globalMessages.portfolioHeaderText
                )}
              />
            }
          />
        }
        showInContainer
        showAsCard
      >
        <SettingsLayout menu={menu}>{children != null ? children : null}</SettingsLayout>
      </TopBarLayout>
    );
    const PortfolioLayoutRevamp = (
      <TopBarLayout
        banner={<BannerContainer actions={actions} stores={stores} />}
        sidebar={sidebarContainer}
        navbar={
          <NavBarContainerRevamp
            actions={actions}
            stores={stores}
            title={
              <NavBarTitle
                title={this.context.intl.formatMessage(
                  isDetailPage
                    ? globalMessages.portfolioDetailHeaderText
                    : globalMessages.portfolioHeaderText
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
    );
    return this.props.renderLayoutComponent({
      CLASSIC: PortfolioLayoutClassic,
      REVAMP: PortfolioLayoutRevamp,
    });
  }
}
export default (withLayout(PortfolioWrapper): ComponentType<Props>);
