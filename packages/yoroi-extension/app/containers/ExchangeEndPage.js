// @flow
import type { Node } from 'react';
import { Component } from 'react';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { IntlContext } from 'react-intl';
import { observer } from 'mobx-react';
import { ROUTES } from '../routes-config';
import TopBarLayout from '../components/layout/TopBarLayout';
import BannerContainer from './banners/BannerContainer';
import SidebarContainer from './SidebarContainer';
import ExchangeEndPageContent from '../components/buySell/ExchangeEndPage';
import type { StoresProps } from '../stores';

@observer
export default class ExchangeEndPage extends Component<StoresProps> {
  static contextType:any = IntlContext;
  render(): Node {
    const { stores } = this.props;

    return (
      <TopBarLayout
        banner={<BannerContainer stores={stores}/>}
        sidebar={<SidebarContainer stores={stores}/>}
        showInContainer
      >
        <ExchangeEndPageContent
          onConfirm={() => stores.routing.goToRoute({ route: ROUTES.WALLETS.TRANSACTIONS })}
        />
      </TopBarLayout>
    );
  }
}
