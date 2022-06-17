// @flow
import { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import { intlShape } from 'react-intl';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import globalMessages from '../../../i18n/global-messages';
import { ROUTES } from '../../../routes-config';
import SubMenu from '../../topbar/SubMenu';

type Props = {|
  +isActiveItem: string => boolean,
  +onItemClick: string => void,
|};
@observer
export default class AssetsMenu extends Component<Props> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  render(): Node {
    const { intl } = this.context;
    const { onItemClick, isActiveItem } = this.props;

    const settingOptions: Array<Object> = [
      {
        label: intl.formatMessage(globalMessages.tokens),
        route: ROUTES.ASSETS.ROOT,
      },
      {
        label: 'NFTs',
        route: ROUTES.NFTS.ROOT,
      },
    ];

    return (
      <SubMenu options={settingOptions} onItemClick={onItemClick} isActiveItem={isActiveItem} />
    );
  }
}
