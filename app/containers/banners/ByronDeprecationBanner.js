// @flow
import type { Node } from 'react';
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { intlShape, defineMessages, } from 'react-intl';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import DeprecatedCurrencyBanner from '../../components/topbar/banners/DeprecatedCurrencyBanner';

const messages = defineMessages({
  byronDeprecationLine1: {
    id: 'wallet.deprecation.byronLine1',
    defaultMessage: '!!!The Shelley protocol upgrade adds a new Shelley wallet type which supports delegation.'
  },
  byronDeprecationLine2: {
    id: 'wallet.deprecation.byronLine2',
    defaultMessage: '!!!To delegate your ADA you will need to upgrade to a Shelley wallet.'
  }
});

type Props = {||};

@observer
export default class ByronDeprecationBanner extends Component<Props> {

  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };

  render(): Node {
    const { intl } = this.context;
    return (
      <DeprecatedCurrencyBanner
        onSubmit={() => {}}
      >
        <>
          {intl.formatMessage(messages.byronDeprecationLine1)}<br />
          {intl.formatMessage(messages.byronDeprecationLine2)}
        </>
      </DeprecatedCurrencyBanner>
    );
  }
}
