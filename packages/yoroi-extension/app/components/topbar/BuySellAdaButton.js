// @flow
import { Component } from 'react';
import type { Node, ComponentType } from 'react';
import { observer } from 'mobx-react';
import { Button } from '@mui/material';
import globalMessages from '../../i18n/global-messages';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { intlShape } from 'react-intl';
import { withLayout } from '../../themes/context/layout';
import type { LayoutComponentMap } from '../../themes/context/layout';

type Props = {|
  +onBuySellClick: void => void,
|};

type InjectedProps = {|
  +renderLayoutComponent: LayoutComponentMap => Node,
|};

@observer
class BuySellAdaButton extends Component<Props & InjectedProps> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  render(): Node {
    const { intl } = this.context;

    const BuyAdaButtonClassic = (
      <Button
        variant="secondary"
        sx={{ width: '230px' }}
        className="secondary"
        onClick={() => this.props.onBuySellClick()}
      >
        {intl.formatMessage(globalMessages.buyAda)}
      </Button>
    );

    const BuyAdaButtonRevamp = (
      <Button
        // TODO: Add new button variant for revamp
        variant="secondary"
        sx={{
          borderColor: '#a7afc0',
          background: 'white',
          width: '160px',
          padding: '11px 0',
          color: '#6b7384',
          fontSize: '14px',
          fontWeight: 500,
          letterSpacing: '0.5px',
          lineHeight: '22px',
          '&:hover': {
            background: 'transparent',
            borderColor: '#a7afc0',
            color: '#6b7384',
          },
        }}
        onClick={() => this.props.onBuySellClick()}
      >
        {intl.formatMessage(globalMessages.buyAda)}
      </Button>
    );

    return this.props.renderLayoutComponent({
      CLASSIC: BuyAdaButtonClassic,
      REVAMP: BuyAdaButtonRevamp,
    });
  }
}

export default (withLayout(BuySellAdaButton): ComponentType<Props>);
