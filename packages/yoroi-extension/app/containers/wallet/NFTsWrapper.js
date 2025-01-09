// @flow
import type { Node } from 'react';
import { Component } from 'react';
import { observer } from 'mobx-react';
import TopBarLayout from '../../components/layout/TopBarLayout';
import BannerContainer from '../banners/BannerContainer';
import NavBarContainerRevamp from '../NavBarContainerRevamp';
import NavBarTitle from '../../components/topbar/NavBarTitle';
import SidebarContainer from '../SidebarContainer';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { intlShape, defineMessages } from 'react-intl';
import { buildRoute } from '../../utils/routing';
import { matchPath } from 'react-router';
import type { StoresProps } from '../../stores';

type Props = {|
  ...StoresProps,
  +children?: Node,
|};

const messages = defineMessages({
  NFTGallery: {
    id: 'wallet.nftGallary.title',
    defaultMessage: '!!!NFT Gallery',
  },
});
@observer
export default class NFTsWrapper extends Component<Props> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };
  static defaultProps: {| children: void |} = {
    children: undefined,
  };
  isActivePage: string => boolean = route => {
    const { location } = this.props.stores.router;
    if (location) {
      return !!matchPath(location.pathname, {
        path: buildRoute(route),
        exact: false,
      });
    }
    return false;
  };

  render(): Node {
    const { stores } = this.props;
    const publicDeriver = this.props.stores.wallets.selected;
    if (!publicDeriver) throw new Error(`Active wallet required for ${nameof(NFTsWrapper)}.`);

    const { intl } = this.context;
    const sidebarContainer = <SidebarContainer stores={stores} />;
    return (
      <TopBarLayout
        banner={<BannerContainer stores={stores} />}
        sidebar={sidebarContainer}
        navbar={
          <NavBarContainerRevamp
            stores={stores}
            title={<NavBarTitle title={intl.formatMessage(messages.NFTGallery)} />}
          />
        }
        withPadding={false}
      >
        {this.props.children}
      </TopBarLayout>
    );
  }
}
