// @flow
import { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import { intlShape } from 'react-intl';
import globalMessages from '../../i18n/global-messages';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { Button } from '@mui/material';

type Props = {|
  +onClick: void => void,
|};

@observer
export default class NavBarAddButton extends Component<Props> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  render(): Node {
    const { onClick } = this.props;

    const { intl } = this.context;

    return (
      <Button variant="primary" onClick={() => onClick()} sx={{ width: '230px' }}>
        {intl.formatMessage(globalMessages.addWalletLabel)}
      </Button>
    );
  }
}
