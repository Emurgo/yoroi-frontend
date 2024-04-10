// @flow
import type { Node } from 'react';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { Component } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';
import { ROUTES } from '../../routes-config';
import SubMenu from '../topbar/SubMenu';

const messages = defineMessages({
  assetSwapLabel: {
    id: 'swap.menu.swap',
    defaultMessage: '!!!Asset swap',
  },
  orderSwapLabel: {
    id: 'swap.menu.orders',
    defaultMessage: '!!!Orders',
  },
});

type Props = {|
  +isActiveItem: string => boolean,
  +onItemClick: string => void,
|};
@observer
export default class SwapMenu extends Component<Props> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  render(): Node {
    const { intl } = this.context;
    const { onItemClick, isActiveItem } = this.props;

    const settingOptions: Array<Object> = [
      {
        label: intl.formatMessage(messages.assetSwapLabel),
        route: ROUTES.SWAP.ROOT,
        className: 'swap',
      },
      {
        label: intl.formatMessage(messages.orderSwapLabel),
        route: ROUTES.SWAP.ORDERS,
        className: 'orders',
      },
    ];

    return (
      <SubMenu
        options={settingOptions}
        onItemClick={onItemClick}
        isActiveItem={isActiveItem}
        locationId='swap'
      />
    );
  }
}
