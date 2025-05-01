// @flow
import type { Node } from 'react';
import { Component } from 'react';
import { defineMessages, IntlContext } from 'react-intl';
import FullscreenMessage from '../../../components/wallet/layouts/FullscreenMessage';
import { observer } from 'mobx-react';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import BigNumber from 'bignumber.js';
import { ReactComponent as InsufficientFundsSvg } from '../../../assets/images/uri/invalid-uri.inline.svg';

export const messages: * = defineMessages({
  title: {
    id: 'wallet.insufficientFunds.title',
    defaultMessage: '!!!Insufficient funds.',
  },
  subtitle: {
    id: 'wallet.insufficientFunds.subtitle',
    defaultMessage: '!!!Participating requires at least {requiredBalance} {tokenName}, but you only have {currentBalance}. Unwithdrawn rewards are not included in this amount.'
  },
});

type Props = {|
  currentBalance: BigNumber,
  requiredBalance: BigNumber,
  tokenName: string,
|};

@observer
export default class InsufficientFundsPage extends Component<Props> {
  static contextType = IntlContext;
  render(): Node {
    const intl = this.context;

    return (
      <FullscreenMessage
        title={intl.formatMessage(messages.title)}
        subtitle={intl.formatMessage(
          messages.subtitle,
          {
            currentBalance: this.props.currentBalance,
            requiredBalance: this.props.requiredBalance,
            tokenName: this.props.tokenName,
          }
        )}
        image={<InsufficientFundsSvg />}
      />
    );
  }
}
