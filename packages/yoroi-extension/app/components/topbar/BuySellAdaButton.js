// @flow
import { Component } from 'react';
import type { Node, ComponentType } from 'react';
import { observer } from 'mobx-react';
import { Button } from '@mui/material';
import globalMessages from '../../i18n/global-messages';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { intlShape } from 'react-intl';
import { withLayout } from '../../styles/context/layout';
import type { LayoutComponentMap } from '../../styles/context/layout';
import environment from '../../environment';

type Props = {|
  +onBuySellClick: void => void,
|};

type InjectedProps = {|
  +renderLayoutComponent: LayoutComponentMap => Node,
|};

const buttonText = (environment.isDev() || environment.isNightly()) ?
  globalMessages.buySellAda :
  globalMessages.buyAda;

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
        {intl.formatMessage(buttonText)}
      </Button>
    );

    const BuyAdaButtonRevamp = (
      <Button
        sx={{
          '&.MuiButton-sizeMedium': { padding: '13px 24px', height: 'unset' },
          lineHeight: '18px',
        }}
        variant="secondary"
        onClick={() => this.props.onBuySellClick()}
      >
        {intl.formatMessage(buttonText)}
      </Button>
    );

    return this.props.renderLayoutComponent({
      CLASSIC: BuyAdaButtonClassic,
      REVAMP: BuyAdaButtonRevamp,
    });
  }
}

export default (withLayout(BuySellAdaButton): ComponentType<Props>);
