// @flow
import { Component } from 'react';
import type { Node, ComponentType } from 'react';
import { computed } from 'mobx';
import { observer } from 'mobx-react';
import { intlShape } from 'react-intl';
import globalMessages from '../../i18n/global-messages';
import SettingsLayout from '../../components/settings/SettingsLayout';
import NavBarContainer from '../NavBarContainer';
import SettingsMenu from '../../components/settings/menu/SettingsMenu';
import BannerContainer from '../banners/BannerContainer';
import type { GeneratedData as BannerContainerData } from '../banners/BannerContainer';
import { buildRoute } from '../../utils/routing';
import type { InjectedOrGenerated } from '../../types/injectedPropsType';
import type { GeneratedData as SidebarContainerData } from '../SidebarContainer';
import type { GeneratedData as NavBarContainerData } from '../NavBarContainer';
import type { GeneratedData as NavBarContainerRevampData } from '../NavBarContainerRevamp';

import TopBarLayout from '../../components/layout/TopBarLayout';
import SidebarContainer from '../SidebarContainer';
import NavBarTitle from '../../components/topbar/NavBarTitle';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { PublicDeriver } from '../../api/ada/lib/storage/models/PublicDeriver/index';
import { withLayout } from '../../styles/context/layout';
import type { LayoutComponentMap } from '../../styles/context/layout';
import NavBarContainerRevamp from '../NavBarContainerRevamp';

export type GeneratedData = typeof Settings.prototype.generated;

type Props = {|
  ...InjectedOrGenerated<GeneratedData>,
  +children?: Node,
|};
type InjectedProps = {|
  +renderLayoutComponent: LayoutComponentMap => Node,
|};

type AllProps = {| ...Props, ...InjectedProps |};
@observer
class Settings extends Component<AllProps> {
  static defaultProps: {| children: void |} = {
    children: undefined,
  };

  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  isActivePage: string => boolean = route => {
    const { location } = this.generated.stores.router;
    if (route && location) {
      return location.pathname === buildRoute(route);
    }
    return false;
  };

  render(): Node {
    const { children } = this.props;
    const { actions } = this.generated;
    const sidebarContainer = <SidebarContainer {...this.generated.SidebarContainerProps} />;

    const menu = (
      <SettingsMenu
        onItemClick={route => actions.router.goToRoute.trigger({ route })}
        isActiveItem={this.isActivePage}
      />
    );

    const SettingsLayoutClassic = (
      <TopBarLayout
        banner={<BannerContainer {...this.generated.BannerContainerProps} />}
        sidebar={sidebarContainer}
        navbar={
          <NavBarContainer
            {...this.generated.NavBarContainerProps}
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
        banner={<BannerContainer {...this.generated.BannerContainerProps} />}
        sidebar={sidebarContainer}
        navbar={
          <NavBarContainerRevamp
            {...this.generated.NavBarContainerRevampProps}
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

  @computed get generated(): {|
    BannerContainerProps: InjectedOrGenerated<BannerContainerData>,
    NavBarContainerProps: InjectedOrGenerated<NavBarContainerData>,
    NavBarContainerRevampProps: InjectedOrGenerated<NavBarContainerRevampData>,
    SidebarContainerProps: InjectedOrGenerated<SidebarContainerData>,
    actions: {|
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
      router: {| location: any |},
      wallets: {| selected: null | PublicDeriver<> |},
    |},
  |} {
    if (this.props.generated !== undefined) {
      return this.props.generated;
    }
    if (this.props.stores == null || this.props.actions == null) {
      throw new Error(`${nameof(Settings)} no way to generated props`);
    }
    const { stores, actions } = this.props;
    return Object.freeze({
      stores: {
        router: {
          location: stores.router.location,
        },
        wallets: {
          selected: stores.wallets.selected,
        },
      },
      actions: {
        router: {
          goToRoute: { trigger: actions.router.goToRoute.trigger },
        },
      },
      SidebarContainerProps: ({ actions, stores }: InjectedOrGenerated<SidebarContainerData>),
      NavBarContainerProps: ({ actions, stores }: InjectedOrGenerated<NavBarContainerData>),
      NavBarContainerRevampProps: ({
        actions,
        stores,
      }: InjectedOrGenerated<NavBarContainerRevampData>),
      BannerContainerProps: ({ actions, stores }: InjectedOrGenerated<BannerContainerData>),
    });
  }
}
export default (withLayout(Settings): ComponentType<Props>);
