// @flow
import type { Node } from 'react';
import { Component } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape, FormattedHTMLMessage } from 'react-intl';
import WarningHeader from './WarningHeader';
import { Button } from '@mui/material';
import globalMessages from '../../../i18n/global-messages';
import { addressSubgroupName } from '../../../types/AddressFilterTypes';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';

const messages = defineMessages({
  warning1: {
    id: 'wallet.receive.page.mangledWarning1',
    defaultMessage: '!!!Mangled addresses contribute to your {ticker} balance but have the incorrect delegation preference'
  },
  fixLabel: {
    id: 'wallet.receive.page.unmangeLabel',
    defaultMessage: '!!!Correct delegation preference'
  },
});

type Props = {|
  +hasMangledUtxo: boolean;
  +onClick: void => void,
  +ticker: string,
|};

@observer
export default class MangledHeader extends Component<Props> {
  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };

  render(): Node {
    const { intl } = this.context;

    return (
      <>
        <WarningHeader
          message={(
            <>
              <div>
                {intl.formatMessage(
                  messages.warning1,
                  { ticker: this.props.ticker }
                )}
              </div><br />
              <div>
                {intl.formatMessage(addressSubgroupName.mangled)}&nbsp;
                <FormattedHTMLMessage {...globalMessages.auditAddressWarning} />
              </div>
            </>
          )}
        >
          {this.props.hasMangledUtxo && (
            <Button
              variant="primary"
              onClick={this.props.onClick}
              sx={{ width: 'max-content' , marginTop: '16px' }}
            >
              {intl.formatMessage(messages.fixLabel)}
            </Button>
          )}
        </WarningHeader>
      </>
    );
  }
}
