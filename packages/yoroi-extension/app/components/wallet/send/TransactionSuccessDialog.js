// @flow

import type { Node } from 'react';
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';
import SuccessPage from '../../transfer/SuccessPage';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';

const messages = defineMessages({
  title: {
    id: 'wallet.transaction.success.title',
    defaultMessage: 'Successfully sent',
  },
  buttonLabel: {
    id: 'wallet.transaction.success.button.label',
    defaultMessage: 'Transaction page',
  },
  explanation: {
    id: 'wallet.transaction.success.explanation',
    defaultMessage: 'Track the status of the transaction from the Transactions page',
  }
});

type Props = {|
  +onClose: void => PossiblyAsync<void>;
  +classicTheme: boolean,
|};

@observer
export default class TransactionSuccessDialog extends Component<Props> {

  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };

  render(): Node {
    const { intl } = this.context;

    return (
      <SuccessPage
        title={intl.formatMessage(messages.title)}
        text={intl.formatMessage(messages.explanation)}
        classicTheme={this.props.classicTheme}
        closeInfo={{
          onClose: this.props.onClose,
          closeLabel: intl.formatMessage(messages.buttonLabel),
        }}
      />
    );
  }
}
