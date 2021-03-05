// @flow
import type { Node } from 'react';
import React, { Component } from 'react';
import { defineMessages, intlShape } from 'react-intl';
import FullscreenMessage from '../../components/wallet/layouts/FullscreenMessage';
import { observer } from 'mobx-react';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';

export const messages: * = defineMessages({
  title: {
    id: 'wallet.unsupported.title',
    defaultMessage: '!!!Wallet type not supported',
  },
  subtitle: {
    id: 'wallet.unsupported.subtitle',
    defaultMessage: '!!!The selected wallet does not support this functionality',
  },
});

type Props = {|
|};

@observer
export default class UnsupportedWallet extends Component<Props> {
  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };

  render(): Node {
    const { intl } = this.context;

    return (
      <FullscreenMessage
        title={intl.formatMessage(messages.title)}
        subtitle={intl.formatMessage(messages.subtitle)}
      />
    );
  }
}
