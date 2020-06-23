// @flow
import type { Node } from 'react';
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { intlShape, defineMessages, } from 'react-intl';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import DeprecatedCurrencyBanner from '../../components/topbar/banners/DeprecatedCurrencyBanner';

const messages = defineMessages({
  itnDeprecationLine1: {
    id: 'wallet.deprecation.itnLine1',
    defaultMessage: '!!!The last ITN rewards were distributed on epoch 190.',
  },
  itnDeprecationLine2: {
    id: 'wallet.deprecation.itnLine2',
    defaultMessage: '!!!Rewards can be claimed on mainnet once Shelley is released on mainnet.'
  }
});

type Props = {||};

@observer
export default class ItnDeprecationBanner extends Component<Props> {

  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };

  render(): Node {
    const { intl } = this.context;
    return (
      <DeprecatedCurrencyBanner
        onSubmit={undefined}
      >
        <>
          {intl.formatMessage(messages.itnDeprecationLine1)}<br />
          {intl.formatMessage(messages.itnDeprecationLine2)}
        </>
      </DeprecatedCurrencyBanner>
    );
  }
}
