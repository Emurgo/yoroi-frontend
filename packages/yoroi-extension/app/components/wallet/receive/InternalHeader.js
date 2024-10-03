// @flow
import type { Node } from 'react';
import { Component } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape, FormattedHTMLMessage, FormattedMessage } from 'react-intl';
import WarningHeader from './WarningHeader';
import { addressSubgroupName } from '../../../types/AddressFilterTypes';
import globalMessages from '../../../i18n/global-messages';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { Box, Link, Typography } from '@mui/material';

const messages = defineMessages({
  warning1: {
    id: 'wallet.receive.page.internalWarning1',
    defaultMessage:
      '!!!Internal addresses (or "change" addresses) maintain your privacy by obscuring which addresses belong to you on the blockchain.',
  },
  blogLinkUrl: {
    id: 'wallet.receive.page.internal.learnMore',
    defaultMessage: '!!!https://emurgo.io/en/blog/understanding-unspent-transaction-outputs-in-cardano',
  },
});

type Props = {|
  +onExternalLinkClick: MouseEvent => void,
|};

@observer
export default class InternalHeader extends Component<Props> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  render(): Node {
    const { intl } = this.context;

    const blogLink = (
      <Link
        href={intl.formatMessage(messages.blogLinkUrl)}
        onClick={event => this.props.onExternalLinkClick(event)}
        underline='none'
        color="ds.primary_500"
      >
        {intl.formatMessage(globalMessages.blogLinkWrapper)}
      </Link>
    );
    return (
      <WarningHeader
        message={
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              justifyContent: 'flex-start',
            }}
          >
            <Typography variant="body1" color="ds.text_gray_medium">
              {intl.formatMessage(messages.warning1)}
            </Typography>
            <Typography
              variant="body1"
              color="ds.text_gray_medium"
            >
              <FormattedMessage {...globalMessages.blogLearnMore} values={{ blogLink }} />
            </Typography>
            <Typography variant="body1" color="ds.text_gray_medium">
              {intl.formatMessage(addressSubgroupName.internal)}&nbsp;
              {intl.formatMessage(globalMessages.auditAddressWarning)}
            </Typography>
          </Box>
        }
      />
    );
  }
}
