// @flow
import { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import { intlShape, } from 'react-intl';
import { Button } from '@mui/material';
import globalMessages from '../../i18n/global-messages';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';

type Props = {|
  +onBuySellClick: void => void,
|};

@observer
export default class BuySellAdaButton extends Component<Props> {

  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };

  render(): Node {

    const { intl } = this.context;

    return (
      <Button
        variant="secondary"
        sx={{ width: '230px' }}
        onClick={() => this.props.onBuySellClick()}
      >
        {intl.formatMessage(globalMessages.buySellAda)}
      </Button>
    );
  }
}
