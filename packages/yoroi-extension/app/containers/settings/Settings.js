// @flow
import { Component } from 'react';
import type { Node, ComponentType } from 'react';
import { observer } from 'mobx-react';
import { intlShape } from 'react-intl';
import globalMessages from '../../i18n/global-messages';
import SettingsLayout from '../../components/settings/SettingsLayout';
import NavBarContainer from '../NavBarContainer';
import SettingsMenu from '../../components/settings/menu/SettingsMenu';
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

type Props = {|
  ...StoresAndActionsProps,
  +children?: Node,
|};
type InjectedLayoutProps = {|
  +renderLayoutComponent: LayoutComponentMap => Node,
|};

type AllProps = {| ...Props, ...InjectedLayoutProps |};
@observer
class Settings extends Component<AllProps> {
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
    const { actions, stores } = this.props;
    const { children } = this.props;
    const sidebarContainer = <SidebarContainer actions={actions} stores={stores} />;

    const menu = (
      <SettingsMenu
        onItemClick={route => stores.app.goToRoute({ route })}
        isActiveItem={this.isActivePage}
      />
    );

    const SettingsLayoutClassic = (
      <TopBarLayout
        banner={<BannerContainer actions={actions} stores={stores} />}
        sidebar={sidebarContainer}
        navbar={
          <NavBarContainer
            actions={actions}
            stores={stores}
            title={
              <NavBarTitle
                title={this.context.intl.formatMessage(globalMessages.sidebarSettings)}
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
    const SettingsLayoutRevamp = (
      <TopBarLayout
        banner={<BannerContainer actions={actions} stores={stores} />}
        sidebar={sidebarContainer}
        navbar={
          <NavBarContainerRevamp
            actions={actions}
            stores={stores}
            title={
              <NavBarTitle
                title={this.context.intl.formatMessage(globalMessages.sidebarSettings)}
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
      CLASSIC: SettingsLayoutClassic,
      REVAMP: SettingsLayoutRevamp,
    });
  }
}
export default (withLayout(Settings): ComponentType<Props>);
