// @flow
import type { Node } from 'react';
import { Component, lazy, Suspense } from 'react';
import { observer } from 'mobx-react';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { intlShape } from 'react-intl';
import type { StoresAndActionsProps } from '../../../types/injectedProps.types';
import TopBarLayout from '../../../components/layout/TopBarLayout';
import BannerContainer from '../../banners/BannerContainer';
import SidebarContainer from '../../SidebarContainer';
import NavBarContainerRevamp from '../../NavBarContainerRevamp';
import NavBarTitle from '../../../components/topbar/NavBarTitle';
import globalMessages from '../../../i18n/global-messages';

// $FlowFixMe[signature-verification-failure]
export const VotingPageContentPromise = () => import('./VotingPageContent');
const VotingPageContent = lazy(VotingPageContentPromise);

@observer
export default class VotingPage extends Component<StoresAndActionsProps> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = { intl: intlShape.isRequired };

  render(): Node {
    const { actions, stores } = this.props;
    const { intl } = this.context;

    const content = (
      <Suspense fallback={null}>
        <VotingPageContent actions={actions} stores={stores} />
      </Suspense>
    );

    return (
      <TopBarLayout
        banner={<BannerContainer actions={actions} stores={stores}/>}
        sidebar={<SidebarContainer actions={actions} stores={stores}/>}
        navbar={
          <NavBarContainerRevamp
            actions={actions}
            stores={stores}
            title={<NavBarTitle title={intl.formatMessage(globalMessages.sidebarVoting)}/>}
          />
        }
        showInContainer
      >
        {content}
      </TopBarLayout>
    );
  }
}
