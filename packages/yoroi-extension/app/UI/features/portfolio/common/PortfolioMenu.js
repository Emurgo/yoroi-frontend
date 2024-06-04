// @flow
import { Component } from 'react';
import type { Node, ComponentType } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';
import environmnent from '../../../../environment';
import { ROUTES } from '../../../../routes-config';
import globalMessages from '../../../../i18n/global-messages';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { withLayout } from '../../../../styles/context/layout';
import type { InjectedLayoutProps } from '../../styles/context/layout';
import type { SubMenuOption } from '../topbar/SubMenu';
import SubMenu from '../../../../components/topbar/SubMenu';
import mockData from './mockData';

export const portfolioMenuMessages: Object = defineMessages({
  wallet: {
    id: 'portfolio.menu.wallet.link.label',
    defaultMessage: '!!!Wallet',
  },
  dapps: {
    id: 'portfolio.menu.dapps.link.label',
    defaultMessage: '!!!Dapps',
  },
});

type Props = {|
  +isActiveItem: string => boolean,
  +onItemClick: string => void,
|};
@observer
class PortfolioMenu extends Component<Props & InjectedLayoutProps> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  render(): Node {
    const { intl } = this.context;
    const { onItemClick, isActiveItem, isRevampLayout } = this.props;
    const isProduction = environmnent.isProduction();
    const portfolioOptions: Array<SubMenuOption> = [
      {
        label: `${intl.formatMessage(portfolioMenuMessages.wallet)} (${mockData.wallet.tokenList.length})`,
        route: ROUTES.PORTFOLIO.ROOT,
        className: 'wallet',
      },
      {
        label: `${intl.formatMessage(portfolioMenuMessages.dapps)} (${
          mockData.dapps.liquidityList.length + mockData.dapps.orderList.length
        })`,
        route: ROUTES.PORTFOLIO.DAPPS,
        className: 'dapps',
      },
    ];

    return <SubMenu options={portfolioOptions} onItemClick={onItemClick} isActiveItem={isActiveItem} locationId="portfolio" />;
  }
}

export default (withLayout(PortfolioMenu): ComponentType<Props>);
