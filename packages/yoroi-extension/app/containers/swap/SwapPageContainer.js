// @flow
import type { Node } from 'react';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { Component } from 'react';
import { observer } from 'mobx-react';
import { intlShape } from 'react-intl';
import { buildRoute } from '../../utils/routing';
import globalMessages from '../../i18n/global-messages';
import SwapMenu from '../../components/swap/SwapMenu';
import BannerContainer from '../banners/BannerContainer';
import TopBarLayout from '../../components/layout/TopBarLayout';
import SidebarContainer from '../SidebarContainer';
import NavBarTitle from '../../components/topbar/NavBarTitle';
import NavBarContainerRevamp from '../NavBarContainerRevamp';
import { SwapFormProvider } from './context/swap-form';
import type { StoresProps } from '../../stores';

type Props = {|
  +children?: Node,
|};

type AllProps = {| ...Props, ...StoresProps |};

@observer
export default class SwapPageContainer extends Component<AllProps> {
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
    const { stores } = this.props;
    const sidebarContainer = <SidebarContainer stores={stores} />;

    const menu = (
      <SwapMenu
        onItemClick={route => stores.app.goToRoute({ route })}
        isActiveItem={this.isActivePage}
      />
    );

    return (
      <TopBarLayout
        banner={<BannerContainer stores={stores} />}
        sidebar={sidebarContainer}
        navbar={
          <NavBarContainerRevamp
            stores={stores}
            title={
              <NavBarTitle title={this.context.intl.formatMessage(globalMessages.sidebarSwap)} />
            }
            menu={menu}
          />
        }
        showInContainer
        withPadding={false}
      >
        <SwapFormProvider swapStore={this.props.stores.substores.ada.swapStore}>
          {children}
        </SwapFormProvider>
      </TopBarLayout>
    );
  }
}
