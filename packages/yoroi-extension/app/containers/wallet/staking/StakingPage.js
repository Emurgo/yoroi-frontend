// @flow
import { Component, Suspense, lazy } from 'react';
import type { Node } from 'react';
import { IntlContext } from 'react-intl';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { observer } from 'mobx-react';
import globalMessages from '../../../i18n/global-messages';
import BannerContainer from '../../banners/BannerContainer';
import SidebarContainer from '../../SidebarContainer';
import NavBarContainerRevamp from '../../NavBarContainerRevamp';
import TopBarLayout from '../../../components/layout/TopBarLayout';
import NavBarTitle from '../../../components/topbar/NavBarTitle';
import { PoolTransitionBanner } from './PoolTransitionBanner';
import type { StoresProps } from '../../../stores';
// $FlowIgnore: suppressing this error
import { ReviewTxProvider } from '../../../UI/features/transaction-review/module/ReviewTxProvider';
// $FlowIgnore: suppressing this error
import { ReviewTxModal } from '../../../UI/features/transaction-review/useCases/ReviewTx';
// $FlowIgnore: suppressing this error
import { CurrencyProvider } from '../../../UI/context/CurrencyContext';
// $FlowIgnore: suppressing this error
import { ModalProvider } from '../../../UI/components/modals/ModalContext';
// $FlowIgnore: suppressing this error
import { ModalManager } from '../../../UI/components/modals/ModalManager';
// $FlowIgnore: suppressing this error
import { DrepPromotionBanner } from '../../../UI/components/DrepPromotionBanner/DrepPromotionBanner';

export const StakingPageContentPromise: void => Promise<any> = () => import('./StakingPageContent');
const StakingPageContent = lazy(StakingPageContentPromise);

@observer
class StakingPage extends Component<StoresProps> {
  static contextType = IntlContext;
  render(): Node {
    const { stores } = this.props;
    const sidebarContainer = <SidebarContainer stores={stores} />;
    const selectedWallet = stores.wallets.selected;
    return (
      <TopBarLayout
        banner={<BannerContainer stores={stores} />}
        sidebar={sidebarContainer}
        navbar={
          <NavBarContainerRevamp
            stores={stores}
            title={<NavBarTitle title={this.context.intl.formatMessage(globalMessages.stakingDashboard)} />}
            pageBanner={
              <PoolTransitionBanner
                intl={this.context.intl}
                showBanner={stores.delegation.getPoolTransitionInfo(selectedWallet)?.shouldShowTransitionFunnel}
              />
            }
          />
        }
        showInContainer
      >
        <Suspense fallback={null}>
          <CurrencyProvider currency={this.props.stores.profile.unitOfAccount.currency || 'USD'}>
            <ModalProvider>
              <ModalManager />
              <ReviewTxProvider stores={stores} intl={this.context.intl}>
                <ReviewTxModal />
                <DrepPromotionBanner stores={stores} page="staking" intl={this.context.intl} />
                <StakingPageContent stores={this.props.stores} />
              </ReviewTxProvider>
            </ModalProvider>
          </CurrencyProvider>
        </Suspense >
      </TopBarLayout >
    );
  }
}
export default StakingPage;
