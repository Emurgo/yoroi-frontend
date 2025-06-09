// @flow
import type { Node } from 'react';
import { Component } from 'react';
import { observer } from 'mobx-react';
import { IntlContext } from 'react-intl';
import { buildRoute } from '../../utils/routing';
import globalMessages from '../../i18n/global-messages';
import SwapMenu from '../../components/swap/SwapMenu';
import BannerContainer from '../banners/BannerContainer';
import TopBarLayout from '../../components/layout/TopBarLayout';
import SidebarContainer from '../SidebarContainer';
import NavBarTitle from '../../components/topbar/NavBarTitle';
import NavBarContainerRevamp from '../NavBarContainerRevamp';
import { SwapFormProvider } from './context/swap-form';
import { ROUTES } from '../../routes-config';

// $FlowIgnore: suppressing this error
import { ReviewTxProvider } from '../../UI/features/transaction-review/module/ReviewTxProvider';
// $FlowIgnore: suppressing this error
import { ReviewTxModal } from '../../UI/features/transaction-review/useCases/ReviewTx';
import type { StoresProps } from '../../stores';
// $FlowIgnore: suppressing this error
import { CurrencyProvider } from '../../UI/context/CurrencyContext';
// $FlowIgnore: suppressing this error
import { ModalProvider } from '../../UI/components/modals/ModalContext';
// $FlowIgnore: suppressing this error
import { ModalManager } from '../../UI/components/modals/ModalManager';
import TestnetDisabledSwap from '../../components/swap/TestnetDisabledSwap';
import SwitchNetworkDialogContainer from '../settings/categories/SwitchNetworkDialogContainer';

type Props = {|
  +children?: Node,
|};

type AllProps = {| ...Props, ...StoresProps |};

@observer
export default class SwapPageContainer extends Component<AllProps> {
  static defaultProps: {| children: void |} = {
    children: undefined,
  };

  static contextType:any = IntlContext;
  isActivePage: string => boolean = route => {
    const { currentRoute } = this.props.stores.routing;
    if (currentRoute) {
      return currentRoute === buildRoute(route);
    }
    return false;
  };

  isErrorPage: void => boolean = () => {
    const { currentRoute } = this.props.stores.routing;
    if (currentRoute) {
      return currentRoute.endsWith(ROUTES.PAGE_ERROR);
    }
    return false;
  };

  render(): Node {
    const { children } = this.props;
    const { stores } = this.props;
    const sidebarContainer = <SidebarContainer stores={stores} />;
    const isErrorPage = this.isErrorPage();
    const { isTestnet } = stores.wallets.selectedOrFail;

    const menu = isTestnet ? null : (
      <SwapMenu onItemClick={route => stores.routing.goToRoute({ route })} isActiveItem={this.isActivePage} />
    );

    return (
      <TopBarLayout
        banner={<BannerContainer stores={stores} />}
        sidebar={sidebarContainer}
        isErrorPage={isErrorPage}
        navbar={
          <NavBarContainerRevamp
            stores={stores}
            title={<NavBarTitle title={this.context.formatMessage(globalMessages.sidebarSwap)} />}
            menu={menu}
            isErrorPage={isErrorPage}
          />
        }
        showInContainer
        withPadding={false}
      >
        {isTestnet ? (
          <TestnetDisabledSwap onSwitch={() => stores.uiDialogs.open({ dialog: SwitchNetworkDialogContainer })} />
        ) : (
          <CurrencyProvider currency={this.props.stores.profile.unitOfAccount.currency || 'USD'}>
            <ModalProvider>
              <ModalManager />
              <SwapFormProvider swapStore={this.props.stores.substores.ada.swapStore}>
                <ReviewTxProvider stores={stores} intl={this.context}>
                  <ReviewTxModal />
                  {children}
                </ReviewTxProvider>
              </SwapFormProvider>
            </ModalProvider>
          </CurrencyProvider>
        )}
      </TopBarLayout>
    );
  }
}
