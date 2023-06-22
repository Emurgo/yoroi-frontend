// @flow
import { Component, Suspense, lazy } from 'react';
import type { Node } from 'react';
import type { GeneratedData as BannerContainerData } from '../../banners/BannerContainer';
import type { InjectedOrGenerated } from '../../../types/injectedPropsType';
import type { GeneratedData as SidebarContainerData } from '../../SidebarContainer';
import type { GeneratedData as NavBarContainerRevampData } from '../../NavBarContainerRevamp';
import type { ConfigType } from '../../../../config/config-types';
import { intlShape } from 'react-intl';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { computed } from 'mobx';
import { observer } from 'mobx-react';
import globalMessages from '../../../i18n/global-messages';
import BannerContainer from '../../banners/BannerContainer';
import SidebarContainer from '../../SidebarContainer';
import NavBarContainerRevamp from '../../NavBarContainerRevamp';
import TopBarLayout from '../../../components/layout/TopBarLayout';
import NavBarTitle from '../../../components/topbar/NavBarTitle';

export const SwapPageContentPromise: void => Promise<any> = () => import('./SwapPageContent');
const SwapPageContent = lazy(SwapPageContentPromise);

export type GeneratedData = typeof SwapPage.prototype.generated;
// populated by ConfigWebpackPlugin
declare var CONFIG: ConfigType;
type Props = {| ...InjectedOrGenerated<GeneratedData>, stores: any, actions: any |};

@observer
class SwapPage extends Component<Props> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  render(): Node {
    const sidebarContainer = <SidebarContainer {...this.generated.SidebarContainerProps} />;
    return (
      <TopBarLayout
        banner={<BannerContainer {...this.generated.BannerContainerProps} />}
        sidebar={sidebarContainer}
        navbar={
          <NavBarContainerRevamp
            {...this.generated.NavBarContainerRevampProps}
            title={
              <NavBarTitle title={this.context.intl.formatMessage(globalMessages.SwapDashboard)} />
            }
          />
        }
        showInContainer
        showAsCard
      >
        <Suspense fallback={null}>
          <SwapPageContent stores={this.props.stores} actions={this.props.actions} />
        </Suspense>
      </TopBarLayout>
    );
  }

  @computed get generated(): {|
    BannerContainerProps: InjectedOrGenerated<BannerContainerData>,
    NavBarContainerRevampProps: InjectedOrGenerated<NavBarContainerRevampData>,
    SidebarContainerProps: InjectedOrGenerated<SidebarContainerData>,
  |} {
    if (this.props.generated !== undefined) {
      return this.props.generated;
    }
    if (this.props.stores == null || this.props.actions == null) {
      throw new Error(`${nameof(SwapPage)} no way to generated props`);
    }

    const { stores, actions } = this.props;

    return Object.freeze({
      SidebarContainerProps: ({ actions, stores }: InjectedOrGenerated<SidebarContainerData>),
      NavBarContainerRevampProps: ({
        actions,
        stores,
      }: InjectedOrGenerated<NavBarContainerRevampData>),
      BannerContainerProps: ({ actions, stores }: InjectedOrGenerated<BannerContainerData>),
    });
  }
}
export default SwapPage;
