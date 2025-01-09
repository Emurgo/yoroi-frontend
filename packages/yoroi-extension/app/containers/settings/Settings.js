// @flow
import type { Node } from 'react';
import { Component } from 'react';
import { observer } from 'mobx-react';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { intlShape } from 'react-intl';
import globalMessages from '../../i18n/global-messages';
import SettingsMenu from '../../components/settings/menu/SettingsMenu';
import BannerContainer from '../banners/BannerContainer';
import { buildRoute } from '../../utils/routing';

import TopBarLayout from '../../components/layout/TopBarLayout';
import SidebarContainer from '../SidebarContainer';
import NavBarTitle from '../../components/topbar/NavBarTitle';
import NavBarContainerRevamp from '../NavBarContainerRevamp';
import type { StoresProps } from '../../stores';

type Props = {|
  +children?: Node,
|};

type AllProps = {| ...Props, ...StoresProps |};
@observer
export default class Settings extends Component<AllProps> {
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
    const { stores } = this.props;
    const { children } = this.props;
    const sidebarContainer = <SidebarContainer stores={stores} />;

    const menu = (
      <SettingsMenu
        onItemClick={route => stores.app.goToRoute({ route })}
        isActiveItem={this.isActivePage}
      />
    );

    return (
      <TopBarLayout
        banner={<BannerContainer stores={stores}/>}
        sidebar={sidebarContainer}
        navbar={
          <NavBarContainerRevamp
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
      >
        {children}
      </TopBarLayout>
    );
  }
}
