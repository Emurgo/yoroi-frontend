// @flow
import type { Node } from 'react';
import { Component } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, IntlContext, FormattedMessage } from 'react-intl';
import WarningHeader from './WarningHeader';
import { addressSubgroupName } from '../../../types/AddressFilterTypes';
import globalMessages from '../../../i18n/global-messages';
import { Box, Link, Typography } from '@mui/material';

const messages = defineMessages({
  internalAddressesTitle: {
    id: 'wallet.receive.page.internalAddressesTitle',
    defaultMessage: '!!!Internal addresses',
  },
  warning1: {
    id: 'wallet.receive.page.internalWarning1',
    defaultMessage:
      '!!!Internal addresses (or "change" addresses) maintain your privacy by obscuring which addresses belong to you on the blockchain.',
  },
  blogLinkUrl: {
    id: 'wallet.receive.page.internal.learnMore',
    defaultMessage: '!!!https://www.emurgo.io/press-news/yoroi-wallet-a-guide-to-the-receive-menu/',
  },
});

type Props = {|
  +onExternalLinkClick: MouseEvent => void,
|};

@observer
export default class InternalHeader extends Component<Props> {
  static contextType:any = IntlContext;
  render(): Node {
    const intl = this.context;

    const blogLink = (
      <Link
        href={intl.formatMessage(messages.blogLinkUrl)}
        onClick={event => this.props.onExternalLinkClick(event)}
        underline="none"
        color="ds.primary_500"
      >
        {intl.formatMessage(globalMessages.blogLinkWrapper)}
      </Link>
    );
    return (
      <Box>
        <Typography
          variant="body1"
          sx={{
            fontWeight: 500,
            paddingBottom: '24px',
          }}
        >
          {intl.formatMessage(messages.internalAddressesTitle)}
        </Typography>
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
                sx={{
                  '& a': {
                    color: 'ds.text_primary_medium',
                  },
                }}
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
      </Box>
    );
  }
}
