// @flow
import { Component, Suspense, lazy } from 'react';
import type { Node } from 'react';
import type { ConfigType } from '../../../../config/config-types';
import { intlShape } from 'react-intl';
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

export const StakingPageContentPromise: void => Promise<any> = () => import('./StakingPageContent');
const StakingPageContent = lazy(StakingPageContentPromise);

// populated by ConfigWebpackPlugin
declare var CONFIG: ConfigType;

@observer
class StakingPage extends Component<StoresProps> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

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
            title={
              <NavBarTitle
                title={this.context.intl.formatMessage(globalMessages.stakingDashboard)}
              />
            }
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
          <StakingPageContent stores={this.props.stores} />
        </Suspense>
      </TopBarLayout>
    );
  }
}
export default StakingPage;
