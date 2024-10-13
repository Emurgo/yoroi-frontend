// @flow
import { lazy, Component, Suspense } from 'react';
import type { Node, ComponentType } from 'react';
import { observer } from 'mobx-react';
import { intlShape } from 'react-intl';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import type { StoresAndActionsProps } from '../../../types/injectedProps.types';
import TopBarLayout from '../../../components/layout/TopBarLayout';
import BannerContainer from '../../banners/BannerContainer';
import SidebarContainer from '../../SidebarContainer';
import NavBarContainerRevamp from '../../NavBarContainerRevamp';
import NavBarTitle from '../../../components/topbar/NavBarTitle';
import globalMessages from '../../../i18n/global-messages';
import { withLayout } from '../../../styles/context/layout';
import type { LayoutComponentMap } from '../../../styles/context/layout';

// $FlowFixMe[signature-verification-failure]
export const VotingPageContentPromise = () => import('./VotingPageContent');
const VotingPageContent = lazy(VotingPageContentPromise);

type Props = StoresAndActionsProps;
type InjectedLayoutProps = {| +renderLayoutComponent: LayoutComponentMap => Node |};
type AllProps = {|
  ...Props,
  ...InjectedLayoutProps,
|};

@observer
class VotingPage extends Component<AllProps> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = { intl: intlShape.isRequired };

  render(): Node {
    const { actions, stores } = this.props;
    const { intl } = this.context;

    const content = (
      <Suspense fallback={null}>
        <VotingPageContent actions={actions} stores={stores} />
      </Suspense>
    );

    const revampLayout = (
      <TopBarLayout
        banner={<BannerContainer actions={actions} stores={stores} />}
        sidebar={<SidebarContainer actions={actions} stores={stores} />}
        navbar={
          <NavBarContainerRevamp
            actions={actions}
            stores={stores}
            title={<NavBarTitle title={intl.formatMessage(globalMessages.sidebarVoting)} />}
          />
        }
        showInContainer
      >
        {content}
      </TopBarLayout>
    );

    return this.props.renderLayoutComponent({
      CLASSIC: content,
      REVAMP: revampLayout,
    });
  }
}

export default (withLayout(VotingPage): ComponentType<Props>);
