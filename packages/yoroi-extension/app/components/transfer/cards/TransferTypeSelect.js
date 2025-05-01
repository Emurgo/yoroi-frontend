// @flow
import { Component } from 'react';
import type { Node } from 'react';
import { defineMessages, IntlContext } from 'react-intl';
import { observer } from 'mobx-react';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import TransferCards from './TransferCards';
import { handleExternalLinkClick } from '../../../utils/routing';
import { Box, Link, Typography } from '@mui/material';
import globalMessages from '../../../i18n/global-messages';

type Props = {|
  +onByron: void => void,
  +ticker: string,
|};

const messages = defineMessages({
  instruction: {
    id: 'wallet.transfer.instruction',
    defaultMessage: '!!!Any {ticker} claimed will be transferred to your currently selected wallet',
  },
  subInstruction: {
    id: 'wallet.transfer.subInstruction',
    defaultMessage: '!!!Learn more about Byron and Shelley eras and how to claim ADA on our',
  },
  faqAbbreviation: {
    id: 'settings.support.faq.abbreviation',
    defaultMessage: '!!!FAQ',
  }
});

@observer
export default class TransferTypeSelect extends Component<Props> {
  static contextType = IntlContext;
  render(): Node {
    const { intl } = this.context;
    const faqLink = (
      <Link
        href={intl.formatMessage(globalMessages.faqLinkUrl)}
        onClick={event => handleExternalLinkClick(event)}
        id="settings:support-faq-link"
      >
        {intl.formatMessage(messages.faqAbbreviation)}
      </Link>
    );

    return (
      <Box height="100%">
        <Box min-height="100%" display="flex" flexDirection="column" alignItems="center">
          <Box display="flex" flexDirection="column" alignItems="center" marginBottom="40px">
            <Typography variant="body1" fontWeight={500} color="ds.text_gray_medium">
              {intl.formatMessage(messages.instruction, { ticker: this.props.ticker })}
            </Typography>
            <Typography variant="body1" color="ds.text_gray_medium">
              {intl.formatMessage(messages.subInstruction, { ticker: this.props.ticker })}
              &nbsp;
              {faqLink}
            </Typography>
          </Box>
          <TransferCards onByron={this.props.onByron} />
        </Box>
      </Box>
    );
  }
}
