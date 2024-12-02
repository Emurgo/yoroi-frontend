// @flow
import type { Node } from 'react';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { Component } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';
import { ROUTES } from '../../routes-config';
import SubMenu from '../topbar/SubMenu';
import { useStrings } from '../../containers/swap/common/useStrings';

type Props = {|
  +isActiveItem: string => boolean,
  +onItemClick: string => void,
|};

export default function SwapMenu({ onItemClick, isActiveItem }: Props): Node {
  const strings = useStrings();

  const settingOptions: Array<Object> = [
    {
      label: strings.assetSwapLabel,
      route: ROUTES.SWAP.ROOT,
      className: 'swap',
    },
    {
      label: strings.orderSwapLabel,
      route: ROUTES.SWAP.ORDERS,
      className: 'orders',
    },
  ];

  return <SubMenu options={settingOptions} onItemClick={onItemClick} isActiveItem={isActiveItem} locationId="swap" />;
}
