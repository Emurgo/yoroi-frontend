// @flow
import type { Node, ComponentType } from 'react';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import type { StoresAndActionsProps } from '../types/injectedProps.types';
import { Component } from 'react';
import { observer } from 'mobx-react';
import { intlShape } from 'react-intl';
import { ROUTES } from '../routes-config';
import TopBarLayout from '../components/layout/TopBarLayout';
import BannerContainer from './banners/BannerContainer';
import SidebarContainer from './SidebarContainer';
import { withLayout } from '../styles/context/layout';
import type { LayoutComponentMap } from '../styles/context/layout';
import ExchangeEndPageContent from '../components/buySell/ExchangeEndPage';

type InjectedLayoutProps = {|
  +selectedLayout: string,
  +renderLayoutComponent: LayoutComponentMap => Node,
|};

type Props = {| ...StoresAndActionsProps, ...InjectedLayoutProps |};

@observer
class ExchangeEndPage extends Component<Props> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  render(): Node {
    const { actions, stores } = this.props;

    const content = (
      <TopBarLayout
        banner={<BannerContainer actions={actions} stores={stores} />}
        sidebar={<SidebarContainer actions={actions} stores={stores} />}
        showInContainer
        showAsCard
      >
        <ExchangeEndPageContent
          onConfirm={() => stores.app.goToRoute({ route: ROUTES.WALLETS.TRANSACTIONS })}
        />
      </TopBarLayout>
    );

    return this.props.renderLayoutComponent({
      CLASSIC: content,
      REVAMP: content,
    });
  }
}

export default (withLayout(ExchangeEndPage): ComponentType<Props>);
