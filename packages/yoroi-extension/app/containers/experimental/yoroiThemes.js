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
import YoroiThemesPage from '../../components/experimental/YoroiTheme/YoroiThemesPage'
import environment from '../../environment'
import { ROUTES } from '../../routes-config'

type Props = StoresAndActionsProps

type InjectedLayoutProps = {| +renderLayoutComponent: LayoutComponentMap => Node |};
type AllProps = {| ...Props, ...InjectedLayoutProps |};

@observer
class YoroiThemesContainer extends Component<AllProps> {

  componentDidMount() {
    if(!environment.isNightly() && !environment.isDev()) {
      this.props.stores.app.goToRoute({ route: ROUTES.MY_WALLETS })
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
            goToRoute={(route) => stores.app.goToRoute({ route })}
          />)
        }
      >
        <FullscreenLayout bottomPadding={0}>
          <YoroiThemesPage />
        </FullscreenLayout>
      </TopBarLayout>
    );
  }
}
export default (withLayout(YoroiThemesContainer): ComponentType<Props>);