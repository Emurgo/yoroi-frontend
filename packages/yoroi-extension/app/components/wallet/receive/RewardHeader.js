// @flow
import type { Node } from 'react';
import { Component } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape, } from 'react-intl';
import WarningHeader from './WarningHeader';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';

const messages = defineMessages({
  rewardAddressLine1: {
    id: 'wallet.receive.page.rewardAddressLine1',
    defaultMessage: '!!!Your reward address holds your rewards and is used to validate any changes to your delegation preference'
  },
  rewardAddressLine2: {
    id: 'wallet.receive.page.rewardAddressLine2',
    defaultMessage: '!!!You cannot send {ticker} to reward addresses, but we show it for personal auditing purposes'
  },
});

type Props = {|
  +ticker: string,
|};

@observer
export default class RewardHeader extends Component<Props> {
  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };

  render(): Node {
    const { intl } = this.context;
    return (
      <WarningHeader
        message={(
          <>
            <div>{intl.formatMessage(messages.rewardAddressLine1)}</div><br />
            <div>
              {intl.formatMessage(
                messages.rewardAddressLine2,
                { ticker: this.props.ticker }
              )}
            </div>
            <br />
          </>
        )}
      />
    );
  }
}
