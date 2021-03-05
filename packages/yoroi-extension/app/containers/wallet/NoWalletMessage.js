// @flow
import type { Node } from 'react';
import React, { Component } from 'react';
import { defineMessages, intlShape } from 'react-intl';
import FullscreenMessage from '../../components/wallet/layouts/FullscreenMessage';
import { observer } from 'mobx-react';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';

export const messages: * = defineMessages({
  title: {
    id: 'wallet.nowallet.title',
    defaultMessage: '!!!No wallet selected',
  },
  subtitle: {
    id: 'wallet.nowallet.subtitle',
    defaultMessage: '!!!Please choose a wallet from the top-right dropdown',
  },
});

type Props = {|
|};

@observer
export default class NoWalletMessage extends Component<Props> {
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
