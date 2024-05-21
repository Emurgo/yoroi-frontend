// @flow
import type { Node, ComponentType } from 'react';
import type { StoresAndActionsProps } from '../../types/injectedProps.types';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import type { LayoutComponentMap } from '../../styles/context/layout';
import { Component } from 'react';
import { observer } from 'mobx-react';
import { intlShape } from 'react-intl';
import { buildRoute } from '../../utils/routing';
import { withLayout } from '../../styles/context/layout';
import globalMessages from '../../i18n/global-messages';
import SwapMenu from '../../components/swap/SwapMenu';
import BannerContainer from '../banners/BannerContainer';
import TopBarLayout from '../../components/layout/TopBarLayout';
import SidebarContainer from '../SidebarContainer';
import NavBarTitle from '../../components/topbar/NavBarTitle';
import NavBarContainerRevamp from '../NavBarContainerRevamp';
import { SwapFormProvider } from './context/swap-form';

type Props = {|
  ...StoresAndActionsProps,
  +children?: Node,
|};

type InjectedLayoutProps = {|
  +renderLayoutComponent: LayoutComponentMap => Node,
|};

type AllProps = {| ...Props, ...InjectedLayoutProps |};

@observer
class SwapPageContainer extends Component<AllProps> {
  static defaultProps: {| children: void |} = {
    children: undefined,
  };

  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  isActivePage: string => boolean = route => {
    const { location } = this.props.stores.router;
    if (location) {
      return location.pathname === buildRoute(route);
    }
    return false;
  };

  render(): Node {
    const { children } = this.props;
    const { actions, stores } = this.props;
    const sidebarContainer = <SidebarContainer actions={actions} stores={stores} />;

    const menu = (
      <SwapMenu
        onItemClick={route => actions.router.goToRoute.trigger({ route })}
        isActiveItem={this.isActivePage}
      />
    );

    return (
      <TopBarLayout
        banner={<BannerContainer actions={actions} stores={stores} />}
        sidebar={sidebarContainer}
        navbar={
          <NavBarContainerRevamp
            actions={actions}
            stores={stores}
            title={
              <NavBarTitle title={this.context.intl.formatMessage(globalMessages.sidebarSwap)} />
            }
            menu={menu}
          />
        }
        showInContainer
        showAsCard
        withPadding={false}
      >
        <SwapFormProvider swapStore={this.props.stores.substores.ada.swapStore}>
          {children}
        </SwapFormProvider>
      </TopBarLayout>
    );
  }
}
export default (withLayout(SwapPageContainer): ComponentType<Props>);
