// @flow
import { Component, Suspense, lazy } from 'react';
import type { Node } from 'react';
import type { StoresAndActionsProps } from '../../../types/injectedProps.types';
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

export const StakingPageContentPromise: void => Promise<any> = () => import('./StakingPageContent');
const StakingPageContent = lazy(StakingPageContentPromise);

// populated by ConfigWebpackPlugin
declare var CONFIG: ConfigType;

@observer
class StakingPage extends Component<StoresAndActionsProps> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  render(): Node {
    const { actions, stores } = this.props;
    const sidebarContainer = <SidebarContainer actions={actions} stores={stores} />;
    return (
      <TopBarLayout
        banner={<BannerContainer actions={actions} stores={stores} />}
        sidebar={sidebarContainer}
        navbar={
          <NavBarContainerRevamp
            actions={actions}
            stores={stores}
            title={
              <NavBarTitle
                title={this.context.intl.formatMessage(globalMessages.stakingDashboard)}
              />
            }
          />
        }
        showInContainer
        showAsCard
      >
        <Suspense fallback={null}>
          <StakingPageContent stores={this.props.stores} actions={this.props.actions} />
        </Suspense>
      </TopBarLayout>
    );
  }
}
export default StakingPage;
