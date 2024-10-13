// @flow
import type { Node } from 'react'
import { Component } from 'react'
import { observer } from 'mobx-react'
import type { StoresAndActionsProps } from '../../types/injectedProps.types'
import TopBarLayout from '../../components/layout/TopBarLayout'
import BannerContainer from '../banners/BannerContainer'
import SidebarContainer from '../SidebarContainer'
import FullscreenLayout from '../../components/layout/FullscreenLayout'
import Navbar from '../../components/experimental/layout/Navbar'
import YoroiPalettePage from '../../components/experimental/YoroiPalette/YoroiPalette'
import environment from '../../environment'
import { ROUTES } from '../../routes-config'

@observer
export default class YoroiPaletteContainer extends Component<StoresAndActionsProps> {

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
