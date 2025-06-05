import { observer } from 'mobx-react';
import * as React from 'react';
import { intlShape } from 'react-intl';
import TopBarLayout from '../../components/layout/TopBarLayout';
import BannerContainer from '../../containers/banners/BannerContainer';
import SidebarContainer from '../../containers/SidebarContainer';
import { ModalProvider } from '../components/modals/ModalContext';

import { ModalManager } from '../components/modals/ModalManager';
import { IntlProvider } from '../context/IntlProvider';
import NotificationsManager from '../features/notifications/common/NotificationsManager';
import { ReviewTxManager } from '../features/transaction-review/module/ReviewTxManager';
import { ReviewTxProvider } from '../features/transaction-review/module/ReviewTxProvider';
import { createCurrrentWalletInfo } from '../utils/createCurrentWalletInfo';
import { SwapContextProvider } from '../features/swap-new/module/SwapContextProvider';

@observer
export default class GeneralPageLayout extends React.Component {
  static defaultProps = {
    children: undefined,
  };

  static contextTypes = {
    intl: intlShape.isRequired,
  };

  render() {
    const { children, navbar, stores } = this.props;
    const sidebarContainer = <SidebarContainer stores={stores} />;
    const currentWalletInfo = createCurrrentWalletInfo(stores);

    const { intl } = this.context;

    return (
      <IntlProvider intl={intl}>
        <ModalProvider>
          <SwapContextProvider currentWallet={currentWalletInfo} stores={stores}>
            <ReviewTxProvider stores={stores} intl={intl}>
              <ModalManager />
              <NotificationsManager />
              <ReviewTxManager />
              <TopBarLayout banner={<BannerContainer stores={stores} />} sidebar={sidebarContainer} navbar={navbar}>
                {children}
              </TopBarLayout>
            </ReviewTxProvider>
          </SwapContextProvider>
        </ModalProvider>
      </IntlProvider>
    );
  }
}
