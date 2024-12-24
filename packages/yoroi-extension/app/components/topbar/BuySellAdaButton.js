// @flow
import type { Node } from 'react';
import { Component } from 'react';
import { observer } from 'mobx-react';
import { Button } from '@mui/material';
import globalMessages from '../../i18n/global-messages';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { intlShape } from 'react-intl';
import environment from '../../environment';

type Props = {|
  +onBuySellClick: void => void,
|};

const buttonText = (environment.isDev() || environment.isNightly()) ?
  globalMessages.buySellAda :
  globalMessages.buyAda;

@observer
export default class BuySellAdaButton extends Component<Props> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  render(): Node {
    const { intl } = this.context;
    return (
      <Button
        sx={{
          '&.MuiButton-sizeMedium': {
            padding: '13px 24px',
            height: 'unset'
          },
          lineHeight: '18px',
        }}
        variant="secondary"
        onClick={() => this.props.onBuySellClick()}
      >
        {intl.formatMessage(buttonText)}
      </Button>
    );
  }
}
