// @flow
import type { Node } from 'react';
import { Component } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';
import WarningHeader from './WarningHeader';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { Box, Typography } from '@mui/material';

const messages = defineMessages({
  rewardAddressesTitle: {
    id: 'wallet.receive.page.rewardAddressesTitle',
    defaultMessage: '!!!Reward addresses',
  },
  rewardAddressLine1: {
    id: 'wallet.receive.page.rewardAddressLine1',
    defaultMessage:
      '!!!Your reward address holds your rewards and is used to validate any changes to your delegation preference.',
  },
  rewardAddressLine2: {
    id: 'wallet.receive.page.rewardAddressLine2',
    defaultMessage: '!!!You cannot send {ticker} to reward addresses, but we show it for personal auditing purposes.',
  },
});

type Props = {|
  +ticker: string,
|};

@observer
export default class RewardHeader extends Component<Props> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  render(): Node {
    const { intl } = this.context;
    return (
      <Box>
        <Typography variant='body1' sx={{
          fontWeight: 500,
          paddingBottom: '24px',
        }}>
          {intl.formatMessage(messages.rewardAddressesTitle)}
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
                {intl.formatMessage(messages.rewardAddressLine1)}
              </Typography>
              <Typography variant="body1" color="ds.text_gray_medium">
                {intl.formatMessage(messages.rewardAddressLine2, { ticker: this.props.ticker })}
              </Typography>
            </Box>
          }
        />
      </Box>
    );
  }
}
