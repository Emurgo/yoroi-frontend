// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape, FormattedHTMLMessage } from 'react-intl';
import WarningHeader from './WarningHeader';
import globalMessages from '../../../i18n/global-messages';

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
  static contextTypes = {
    intl: intlShape.isRequired,
  };

  render() {
    const { intl } = this.context;
    return (
      <WarningHeader
        message={(
          <>
            <p>{intl.formatMessage(messages.warning1)}</p><br />
            <p>
              {intl.formatMessage(globalMessages.internalLabel)}&nbsp;
              <FormattedHTMLMessage {...globalMessages.auditAddressWarning} />
            </p>
          </>
        )}
      />
    );
  }
}
