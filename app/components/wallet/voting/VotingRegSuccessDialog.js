// @flow

import type { Node } from 'react';
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';
import SuccessPage from '../../transfer/SuccessPage';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';

const messages = defineMessages({
  title: {
    id: 'wallet.voting.transaction.success.title',
    defaultMessage: '!!!Successfully Registered',
  },
  buttonLabel: {
    id: 'wallet.voting.transaction.success.button.label',
    defaultMessage: '!!!Dashboard page',
  },
  explanation: {
    id: 'wallet.voting.transaction.success.explanation',
    defaultMessage: '!!!explainer for voting registration',
  }
});

type Props = {|
  +onClose: void => PossiblyAsync<void>;
  +classicTheme: boolean,
|};

@observer
export default class VotingRegSuccessDialog extends Component<Props> {

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
