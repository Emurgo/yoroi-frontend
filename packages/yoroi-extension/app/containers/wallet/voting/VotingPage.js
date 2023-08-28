// @flow
import { lazy, Component, Suspense } from 'react';
import type { Node, ComponentType } from 'react';
import { observer } from 'mobx-react';
import { computed } from 'mobx';
import { intlShape } from 'react-intl';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import type { InjectedOrGenerated } from '../../../types/injectedPropsType';
import type { GeneratedData as VotingPageContentProps } from './VotingPageContent';
import TopBarLayout from '../../../components/layout/TopBarLayout';
import BannerContainer from '../../banners/BannerContainer';
import SidebarContainer from '../../SidebarContainer';
import NavBarContainerRevamp from '../../NavBarContainerRevamp';
import NavBarTitle from '../../../components/topbar/NavBarTitle';
import globalMessages from '../../../i18n/global-messages';
import { withLayout } from '../../../styles/context/layout';
import type { LayoutComponentMap } from '../../../styles/context/layout';
import type { GeneratedData as SidebarContainerData } from '../../SidebarContainer';
import type { GeneratedData as BannerContainerData } from '../../banners/BannerContainer';
import type { GeneratedData as NavBarContainerRevampData } from '../../NavBarContainerRevamp';

// $FlowFixMe[signature-verification-failure]
export const VotingPageContentPromise = () => import('./VotingPageContent');
const VotingPageContent = lazy(VotingPageContentPromise);

export type GeneratedData = typeof VotingPage.prototype.generated;
type Props = InjectedOrGenerated<GeneratedData>;
type InjectedProps = {| +renderLayoutComponent: LayoutComponentMap => Node |};
type AllProps = {|
  ...Props,
  ...InjectedProps,
|};

@observer
class VotingPage extends Component<AllProps> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = { intl: intlShape.isRequired };

  render(): Node {
    const { intl } = this.context;

    const content = (
      <Suspense fallback={null}>
        <VotingPageContent {...this.generated.VotingPageContentProps} />
      </Suspense>
    );

    const revampLayout = (
      <TopBarLayout
        banner={<BannerContainer {...this.generated.BannerContainerProps} />}
        sidebar={<SidebarContainer {...this.generated.SidebarContainerProps} />}
        navbar={
          <NavBarContainerRevamp
            {...this.generated.NavBarContainerRevampProps}
            title={<NavBarTitle title={intl.formatMessage(globalMessages.sidebarVoting)} />}
          />
        }
        showInContainer
        showAsCard
      >
        {content}
      </TopBarLayout>
    );

    return this.props.renderLayoutComponent({
      CLASSIC: content,
      REVAMP: revampLayout,
    });
  }

  @computed get generated(): {|
    BannerContainerProps: InjectedOrGenerated<BannerContainerData>,
    NavBarContainerRevampProps: InjectedOrGenerated<NavBarContainerRevampData>,
    SidebarContainerProps: InjectedOrGenerated<SidebarContainerData>,
    VotingPageContentProps: InjectedOrGenerated<VotingPageContentProps>,
  |} {
    if (this.props.generated !== undefined) {
      return this.props.generated;
    }

    if (this.props.stores == null || this.props.actions == null) {
      throw new Error(`${nameof(VotingPage)} no way to generated props`);
    }

    const { stores, actions } = this.props;
    return Object.freeze({
      VotingPageContentProps: ({
        actions,
        stores,
      }: InjectedOrGenerated<VotingPageContentProps>),
      SidebarContainerProps: ({ actions, stores }: InjectedOrGenerated<SidebarContainerData>),
      NavBarContainerRevampProps: ({
        actions,
        stores,
      }: InjectedOrGenerated<NavBarContainerRevampData>),
      BannerContainerProps: ({ actions, stores }: InjectedOrGenerated<BannerContainerData>),
    });
  }
}

export default (withLayout(VotingPage): ComponentType<Props>);
