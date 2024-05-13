// @flow
import type { Node, ComponentType } from 'react'
import { Component } from 'react'
import { observer } from 'mobx-react'
import type { StoresAndActionsProps } from '../../types/injectedProps.types'
import TopBarLayout from '../../components/layout/TopBarLayout'
import BannerContainer from '../banners/BannerContainer'
import { withLayout } from '../../styles/context/layout'
import type { LayoutComponentMap } from '../../styles/context/layout'
import SidebarContainer from '../SidebarContainer'
import FullscreenLayout from '../../components/layout/FullscreenLayout'
import Navbar from '../../components/experimental/layout/Navbar'
import YoroiPalettePage from '../../components/experimental/YoroiPalette/YoroiPalette'
import environment from '../../environment'
import { ROUTES } from '../../routes-config'

type Props = StoresAndActionsProps

type InjectedLayoutProps = {| +renderLayoutComponent: LayoutComponentMap => Node |};
type AllProps = {| ...Props, ...InjectedLayoutProps |};

@observer
class YoroiPaletteContainer extends Component<AllProps> {

  componentDidMount() {
    if(!environment.isNightly() && !environment.isDev()) {
      this.props.actions.router.goToRoute.trigger({ route: ROUTES.MY_WALLETS })
    }
  }

  render (): Node {
    const { actions, stores } = this.props;
    const sidebarContainer = <SidebarContainer actions={actions} stores={stores} />
    return (
      <TopBarLayout
        banner={(<BannerContainer actions={actions} stores={stores} />)}
        sidebar={sidebarContainer}
        navbar={
          (<Navbar
            goToRoute={(route) => this.props.actions.router.goToRoute.trigger({ route })}
          />)
        }
      >
        <FullscreenLayout bottomPadding={0}>
          <YoroiPalettePage />
        </FullscreenLayout>
      </TopBarLayout>
    );
  }
}
export default (withLayout(YoroiPaletteContainer): ComponentType<Props>);