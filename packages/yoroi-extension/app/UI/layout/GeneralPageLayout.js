import { observer } from 'mobx-react';
import * as React from 'react';
import TopBarLayout from '../../components/layout/TopBarLayout';
import BannerContainer from '../../containers/banners/BannerContainer';
import SidebarContainer from '../../containers/SidebarContainer';
import { ModalProvider } from '../components/modals/ModalContext';

import { ModalManager } from '../components/modals/ModalManager';
import NotificationsManager from '../features/notifications/common/NotificationsManager';
import { ReviewTxManager } from '../features/transaction-review/module/ReviewTxManager';
import { ReviewTxProvider } from '../features/transaction-review/module/ReviewTxProvider';


@observer
export default class GeneralPageLayout extends React.Component {
  static defaultProps = {
    children: undefined,
  };

  render() {
    const { children, navbar, stores } = this.props;
    const sidebarContainer = <SidebarContainer stores={stores} />;

    return (
      <ModalProvider>
        <ReviewTxProvider stores={stores} >
          <ModalManager />
          <NotificationsManager />
          <ReviewTxManager />
          <TopBarLayout banner={<BannerContainer stores={stores} />} sidebar={sidebarContainer} navbar={navbar}>
            {children}
          </TopBarLayout>
        </ReviewTxProvider>
      </ModalProvider>
    );
  }
}
