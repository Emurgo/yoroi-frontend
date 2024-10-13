// @flow

import type { Node } from 'react';
import { Component } from 'react';
import { observer } from 'mobx-react';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { defineMessages, intlShape } from 'react-intl';
import { SuccessPageRevamp } from '../../transfer/SuccessPageRevamp';
import globalMessages from '../../../i18n/global-messages';

const messages = defineMessages({
  title: {
    id: 'wallet.delegation.transaction.success.title',
    defaultMessage: '!!!Successfully delegated',
  },
  buttonLabel: {
    id: 'wallet.delegation.transaction.success.button.label',
    defaultMessage: '!!!Dashboard page',
  },
  buttonLabelRevamp: {
    id: 'wallet.delegation.transaction.success.button.labelRevamp',
    defaultMessage: '!!!Go to dashboard',
  },
  explanation: {
    id: 'wallet.delegation.transaction.success.explanation',
    defaultMessage:
      '!!!Track the status of the stake pool and the amount of time remaining to receive a reward from the Dashboard page',
  },
  explanationRevamp: {
    id: 'wallet.delegation.transaction.success.explanationRevamp',
    defaultMessage:
      '!!!The first reward to receive takes 3-4 epochs which is equal to 15-20 days. Track the status of the stake pool and rewards on the Staking Dashboard.',
  },
});

type Props = {|
  +onClose: void => PossiblyAsync<void>,
|};

@observer
export default class DelegationSuccessDialog extends Component<Props> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  render(): Node {
    const { intl } = this.context;
    return (
      <SuccessPageRevamp
        title={intl.formatMessage(globalMessages.success)}
        text={intl.formatMessage(messages.explanationRevamp)}
        closeInfo={{
          onClose: this.props.onClose,
          closeLabel: intl.formatMessage(messages.buttonLabelRevamp),
        }}
      />
    );
  }
}
