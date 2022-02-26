// @flow
import type { Node, ComponentType } from 'react'
import { Component } from 'react'
import { computed } from 'mobx'
import { observer } from 'mobx-react'
import type { InjectedOrGenerated } from '../../types/injectedPropsType'
import TopBarLayout from '../../components/layout/TopBarLayout'
import type { GeneratedData as SidebarContainerData } from '../SidebarContainer'
import type { GeneratedData as BannerContainerData } from '../banners/BannerContainer'
import BannerContainer from '../banners/BannerContainer'
import { withLayout } from '../../styles/context/layout'
import type { LayoutComponentMap } from '../../styles/context/layout'
import SidebarContainer from '../SidebarContainer'
import ConnectedWebsitesPage from '../../components/dapp-connector/ConnectedWebsites/ConnectedWebsitesPage'
import FullscreenLayout from '../../components/layout/FullscreenLayout'
import Navbar from '../../components/experimental/layout/Navbar'
import YoroiThemesPage from '../../components/experimental/YoroiTheme/YoroiThemesPage'
import { PublicDeriver } from '../../api/ada/lib/storage/models/PublicDeriver/index';
import environment from '../../environment'
import { ROUTES } from '../../routes-config'


export type GeneratedData = typeof YoroiThemesContainer.prototype.generated;

type Props = InjectedOrGenerated<GeneratedData>

type InjectedProps = {| +renderLayoutComponent: LayoutComponentMap => Node |};
type AllProps = {| ...Props, ...InjectedProps |};

@observer
class YoroiThemesContainer extends Component<AllProps> {

  componentDidMount() {
    if(!environment.isNightly() && !environment.isDev()) {
      this.generated.actions.router.goToRoute.trigger({ route: ROUTES.MY_WALLETS })
    }
  }

  render (): Node {
    const sidebarContainer = <SidebarContainer {...this.generated.SidebarContainerProps} />
    return (
      <TopBarLayout
        banner={(<BannerContainer {...this.generated.BannerContainerProps} />)}
        sidebar={sidebarContainer}
        navbar={
          (<Navbar
            goToRoute={(route) => this.generated.actions.router.goToRoute.trigger({ route })}
          />)
        }
      >
        <FullscreenLayout bottomPadding={0}>
          <YoroiThemesPage />
        </FullscreenLayout>
      </TopBarLayout>
    );
  }


  @computed get generated (): {|
    BannerContainerProps: InjectedOrGenerated<BannerContainerData>,
    SidebarContainerProps: InjectedOrGenerated<SidebarContainerData>,
    actions: {|
      router: {|
        redirect: {|
          trigger: (params: {|
            params?: ?any,
            route: string
          |}) => void
        |},
        goToRoute: {|
          trigger: (params: {|
            publicDeriver?: null | PublicDeriver<>,
            params?: ?any,
            route: string
          |}) => void
        |}
      |}
    |}
    |} {
    if (this.props.generated !== undefined) {
      return this.props.generated;
    }
    if (this.props.stores == null || this.props.actions == null) {
      throw new Error(`${nameof(ConnectedWebsitesPage)} no way to generated props`);
    }
    const { stores, actions } = this.props;
    return Object.freeze({
      actions: {
        router: {
          goToRoute: { trigger: actions.router.goToRoute.trigger },
          redirect: { trigger: actions.router.redirect.trigger },
        },
      },
      SidebarContainerProps: (
        { actions, stores }: InjectedOrGenerated<SidebarContainerData>
      ),
      BannerContainerProps: ({ actions, stores }: InjectedOrGenerated<BannerContainerData>),
    });
  }
}
export default (withLayout(YoroiThemesContainer): ComponentType<Props>);