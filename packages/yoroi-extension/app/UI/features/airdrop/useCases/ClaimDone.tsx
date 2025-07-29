import { Box, Typography, Stack } from '@mui/material';
import { useIntl, defineMessages } from 'react-intl';
import globalMessages from '../../../../i18n/global-messages';
import type BigNumber from 'bignumber.js';

const messages = defineMessages({
  size: {
    id: 'airdrop.size',
    defaultMessage: '!!!Your allocation size',
  },
  destinationAddress: {
    id: 'airdrop.destinationAddress',
    defaultMessage: '!!!Your destination address',
  },
});

interface Props {
  alloc: BigNumber,
  destAddrBech32: string,
}

const NUMBER_OF_NIGHT_DECIMALS = 6;

export default function ClaimDone(props: Props) {
  const intl = useIntl();
  const { alloc, destAddrBech32 } = props;

  return (
    <Stack spacing="24px">
      <Box  sx={{ border: '1px solid', borderColor: 'ds.gray_200', padding: '16px', borderRadius: '8px' }}>
        <Stack spacing="16px">
          <Typography variant="h5">
            {intl.formatMessage(messages.size)}
          </Typography>
          <Box>
            <Typography variant="h2" component="span">
              {alloc.div(10 ** NUMBER_OF_NIGHT_DECIMALS).toFormat()}
            </Typography>
            &nbsp;
            <Typography variant="body2" sx={{ fontWeight: 500 }} component="span">
              NIGHT
            </Typography>
          </Box>
        </Stack>
      </Box>
      <Box sx={{ border: '1px solid', borderColor: 'ds.gray_200', padding: '16px', borderRadius: '8px' }}>
        <Stack spacing="16px">
          <Typography variant="h5">
            {intl.formatMessage(messages.destinationAddress)}
          </Typography>
          <Typography variant="body1" sx={{ fontWeight: 500 }}>
            {intl.formatMessage(globalMessages.addressLabel)}
          </Typography>
          <Typography variant="body1" color="ds.text_gray_low" sx={{ wordBreak: 'break-all' }}>
            {destAddrBech32}
          </Typography>
        </Stack>
      </Box>
    </Stack>
  );
}
