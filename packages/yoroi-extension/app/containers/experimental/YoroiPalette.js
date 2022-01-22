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
import YoroiPalettePage from '../../components/experimental/YoroiPalette/YoroiPalette'

export type GeneratedData = typeof YoroiPaletteContainer.prototype.generated;

type Props = InjectedOrGenerated<GeneratedData>

type InjectedProps = {| +renderLayoutComponent: LayoutComponentMap => Node |};
type AllProps = {| ...Props, ...InjectedProps |};

@observer
class YoroiPaletteContainer extends Component<AllProps> {

  render (): Node {
    const sidebarContainer = <SidebarContainer {...this.generated.SidebarContainerProps} />
    return (
      <TopBarLayout
        banner={(<BannerContainer {...this.generated.BannerContainerProps} />)}
        sidebar={sidebarContainer}
        navbar={<Navbar header="Yoroi Palette" />}
      >
        <FullscreenLayout bottomPadding={0}>
          <YoroiPalettePage />
        </FullscreenLayout>
      </TopBarLayout>
    );
  }


  @computed get generated (): {|
    BannerContainerProps: InjectedOrGenerated<BannerContainerData>,
    SidebarContainerProps: InjectedOrGenerated<SidebarContainerData>,
    |} {
    if (this.props.generated !== undefined) {
      return this.props.generated;
    }
    if (this.props.stores == null || this.props.actions == null) {
      throw new Error(`${nameof(ConnectedWebsitesPage)} no way to generated props`);
    }
    const { stores, actions } = this.props;
    return Object.freeze({
      SidebarContainerProps: (
        { actions, stores }: InjectedOrGenerated<SidebarContainerData>
      ),
      BannerContainerProps: ({ actions, stores }: InjectedOrGenerated<BannerContainerData>),
    });
  }
}
export default (withLayout(YoroiPaletteContainer): ComponentType<Props>);