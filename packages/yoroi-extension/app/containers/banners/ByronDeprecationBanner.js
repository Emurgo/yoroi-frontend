// @flow
import type { Node } from 'react';
import { Component } from 'react';
import { observer } from 'mobx-react';
import { IntlContext, defineMessages, } from 'react-intl';
import DeprecatedCurrencyBanner from '../../components/topbar/banners/DeprecatedCurrencyBanner';

const messages = defineMessages({
  byronDeprecationLine1: {
    id: 'wallet.deprecation.byronLine1',
    defaultMessage: '!!!The Shelley protocol upgrade adds a new Shelley wallet type which supports delegation.'
  },
  byronDeprecationLine2: {
    id: 'wallet.deprecation.byronLine2',
    defaultMessage: '!!!To delegate your {ticker} you will need to upgrade to a Shelley wallet.'
  }
});

type Props = {|
  onUpgrade: void | (void => void),
  ticker: string,
|};

@observer
export default class ByronDeprecationBanner extends Component<Props> {

  static contextType:any = IntlContext;
  render(): Node {
    const intl = this.context;
    return (
      <DeprecatedCurrencyBanner
        onSubmit={this.props.onUpgrade}
      >
        <>
          {intl.formatMessage(messages.byronDeprecationLine1)}<br />
          {intl.formatMessage(
            messages.byronDeprecationLine2,
            { ticker: this.props.ticker }
          )}
        </>
      </DeprecatedCurrencyBanner>
    );
  }
}
