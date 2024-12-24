// @flow
import type { Node } from 'react';
import { Component } from 'react';
import { observer } from 'mobx-react';
import type { StoresAndActionsProps } from '../../types/injectedProps.types';
import TopBarLayout from '../../components/layout/TopBarLayout';
import BannerContainer from '../banners/BannerContainer';
import NavBarContainerRevamp from '../NavBarContainerRevamp';
import NavBarTitle from '../../components/topbar/NavBarTitle';
import globalMessages from '../../i18n/global-messages';
import SidebarContainer from '../SidebarContainer';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { intlShape } from 'react-intl';

type Props = {|
  ...StoresAndActionsProps,
  +children?: Node,
|};
@observer
export default class AssetsWrapper extends Component<Props> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };
  static defaultProps: {| children: void |} = {
    children: undefined,
  };

  render(): Node {
    const { actions, stores } = this.props;
    const publicDeriver = this.props.stores.wallets.selected;
    if (!publicDeriver) throw new Error(`Active wallet required for ${nameof(AssetsWrapper)}.`);

    const { intl } = this.context;
    const sidebarContainer = <SidebarContainer actions={actions} stores={stores} />;

    return (
      <TopBarLayout
        banner={<BannerContainer actions={actions} stores={stores} />}
        sidebar={sidebarContainer}
        navbar={
          <NavBarContainerRevamp
            actions={actions}
            stores={stores}
            title={<NavBarTitle title={intl.formatMessage(globalMessages.sidebarAssets)} />}
          />
        }
        showInContainer
      >
        {this.props.children}
      </TopBarLayout>
    );
  }
}
