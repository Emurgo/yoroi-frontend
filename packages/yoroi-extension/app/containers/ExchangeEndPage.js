// @flow
import type { Node } from 'react';
import { Component } from 'react';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { intlShape } from 'react-intl';
import type { StoresAndActionsProps } from '../types/injectedProps.types';
import { observer } from 'mobx-react';
import { ROUTES } from '../routes-config';
import TopBarLayout from '../components/layout/TopBarLayout';
import BannerContainer from './banners/BannerContainer';
import SidebarContainer from './SidebarContainer';
import ExchangeEndPageContent from '../components/buySell/ExchangeEndPage';

@observer
export default class ExchangeEndPage extends Component<StoresAndActionsProps> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  render(): Node {
    const { actions, stores } = this.props;

    return (
      <TopBarLayout
        banner={<BannerContainer actions={actions} stores={stores}/>}
        sidebar={<SidebarContainer actions={actions} stores={stores}/>}
        showInContainer
        showAsCard
      >
        <ExchangeEndPageContent
          onConfirm={() => actions.router.goToRoute.trigger({ route: ROUTES.WALLETS.TRANSACTIONS })}
        />
      </TopBarLayout>
    );
  }
}
