// @flow
import type { Node } from 'react';
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape, FormattedHTMLMessage } from 'react-intl';
import WarningHeader from './WarningHeader';
import { addressTypes } from '../../../types/AddressFilterTypes';
import globalMessages from '../../../i18n/global-messages';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';

const messages = defineMessages({
  warning1: {
    id: 'wallet.receive.page.internalWarning1',
    defaultMessage: '!!!Internal addresses (or "change" addresses) maintain your privacy by obscuring which addresses belong to you on the blockchain'
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
            <p>{intl.formatMessage(messages.warning1)}</p><br />
            <p>
              {intl.formatMessage(addressTypes.internal)}&nbsp;
              <FormattedHTMLMessage {...globalMessages.auditAddressWarning} />
            </p>
          </>
        )}
      />
    );
  }
}
