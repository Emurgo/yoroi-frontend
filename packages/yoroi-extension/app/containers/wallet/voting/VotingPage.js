// @flow
import type { Node } from 'react';
import { Component, lazy, Suspense } from 'react';
import { observer } from 'mobx-react';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { intlShape } from 'react-intl';
import TopBarLayout from '../../../components/layout/TopBarLayout';
import BannerContainer from '../../banners/BannerContainer';
import SidebarContainer from '../../SidebarContainer';
import NavBarContainerRevamp from '../../NavBarContainerRevamp';
import NavBarTitle from '../../../components/topbar/NavBarTitle';
import globalMessages from '../../../i18n/global-messages';
import type { StoresProps } from '../../../stores';

// $FlowFixMe[signature-verification-failure]
export const VotingPageContentPromise = () => import('./VotingPageContent');
const VotingPageContent = lazy(VotingPageContentPromise);

@observer
export default class VotingPage extends Component<StoresProps> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = { intl: intlShape.isRequired };

  render(): Node {
    const { stores } = this.props;
    const { intl } = this.context;

    const content = (
      <Suspense fallback={null}>
        <VotingPageContent stores={stores} />
      </Suspense>
    );

    return (
      <TopBarLayout
        banner={<BannerContainer stores={stores}/>}
        sidebar={<SidebarContainer stores={stores}/>}
        navbar={
          <NavBarContainerRevamp
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
