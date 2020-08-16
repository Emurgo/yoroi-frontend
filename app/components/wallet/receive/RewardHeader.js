// @flow
import type { Node } from 'react';
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape, } from 'react-intl';
import WarningHeader from './WarningHeader';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';

const messages = defineMessages({
  rewardAddressLine1: {
    id: 'wallet.receive.page.rewardAddressLine1',
    defaultMessage: '!!!Your reward holds your rewards and is used to validate any changes to your delegation preference'
  },
  rewardAddressLine2: {
    id: 'wallet.receive.page.rewardAddressLine2',
    defaultMessage: '!!!You cannot send ADA to reward addresses, but we show it for personal auditing purposes'
  },
});

type Props = {|
|};

@observer
export default class InternalHeader extends Component<Props> {
  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };

  render(): Node {
    const { intl } = this.context;
    return (
      <WarningHeader
        message={(
          <>
            <p>{intl.formatMessage(messages.rewardAddressLine1)}</p><br />
            <p>{intl.formatMessage(messages.rewardAddressLine2)}</p><br />
          </>
        )}
      />
    );
  }
}
