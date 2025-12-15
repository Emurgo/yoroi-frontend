import { Box, Typography } from '@mui/material';
import { useIntl, defineMessages } from 'react-intl';
import globalMessages from '../../../../i18n/global-messages';
import { type Status } from '../../../../api/ada/midnightRedemption';

const messages = defineMessages({
  dstAddr: {
    id: 'aidrop.addrCard.destAddr',
    defaultMessage: '!!!Destination address {index}',
  },
  status: {
    id: 'aidrop.addrCard.statusLabel',
    defaultMessage: '!!!Status',
  },
  redeemable: {
    id: 'airdrop.addrCard.redeemableLabel',
    defaultMessage: '!!!Redeemable',
  },
  total: {
    id: 'airdrop.addrCard.totalLable',
    defaultMessage: '!!!Total',
  },
  statusReady: {
    id: 'airdrop.addrCard.statusReady',
    defaultMessage: '!!!Ready for redemption',
  },
  statusNotReady: {
    id: 'airdrop.addrCard.statusNotReady',
    defaultMessage: '!!!Wait for thawing',
  },
});

interface Props {
  index: number;
  address: string;
  status: Status;
  redeemable: string;
  total: string;
  isSelected: boolean;
  onSelect: () => void;
}

export default function AddressCard({ index, address, status, redeemable, total, isSelected, onSelect }: Props) {
  const intl = useIntl();
  const statusString = intl.formatMessage({
    ready: messages.statusReady,
    notReady: messages.statusNotReady,
  }[status]);
    
  return (
    <Box
      sx={{
        marginLeft: 'auto',
        marginRight: 'auto',
        width: '612px',
        borderRadius: '8px',
        bgcolor: 'ds.bg_color_contrast_min',
        padding: '24px',
      }}
    >
      {/*  @ts-ignore */}
      <Typography variant="h1xl">
        {intl.formatMessage(messages.dstAddr, { index })}
      </Typography>

      {/*  @ts-ignore */}
      <Typography variant="body1">
        {address}
      </Typography>

      {/*  @ts-ignore */}
      <Typography variant="body1">
        {intl.formatMessage(messages.status)}
      </Typography>

      {/*  @ts-ignore */}
      <Typography variant="body1">
        {statusString}
      </Typography>

      {/*  @ts-ignore */}
      <Typography variant="body1">
        {intl.formatMessage(messages.redeemable)}
      </Typography>

      {/*  @ts-ignore */}
      <Typography variant="body1">
      {redeemable}&nbsp;NIGHT
      </Typography>

      {/*  @ts-ignore */}
      <Typography variant="body1">
        {intl.formatMessage(messages.total)}
      </Typography>

      {/*  @ts-ignore */}
      <Typography variant="body1">
      {total}&nbsp;NIGHT
      </Typography>
    </Box>
  );
}
