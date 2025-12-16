import { Box, Typography } from '@mui/material';
import { useIntl, defineMessages } from 'react-intl';
import globalMessages from '../../../../i18n/global-messages';
import { type Status } from '../../../../api/ada/midnightRedemption';
import CopyableText from '../../../components/CopyableText';
import { IconWrapper, Icons } from '../../../components';

const messages = defineMessages({
  dstAddrs: {
    id: 'airdrop.addrCard.destAddrs',
    defaultMessage: '!!!Destination addresses ({count})',
  },
  dstAddr: {
    id: 'aidrop.addrCard.destAddr',
    defaultMessage: '!!!Destination address {index}',
  },
  dstAddrLabel: {
    id: 'airdrop.addrCard.destAddrLabel',
    defaultMessage: '!!!Destination address',
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
    defaultMessage: '!!!Waiting for thawing',
  },
});

export function AddressesTitle({ count }: { count: number }) {
  const intl = useIntl();
  return (
    <Typography variant="heading-4-regular" sx={{ fontWeight: 500, fontSize: '20px', lineHeight: '28px' }} as="div">
      {intl.formatMessage(messages.dstAddrs, { count })}
    </Typography>
  );
}

interface Props {
  index: number;
  address: string;
  status: Status;
  redeemable: string;
  total: string;
  isSelected: boolean;
  onSelect: () => void;
}

export function AddressCard({ index, address, status, redeemable, total, isSelected, onSelect }: Props) {
  const intl = useIntl();
  const statusString = intl.formatMessage({
    ready: messages.statusReady,
    notReady: messages.statusNotReady,
  }[status]);
  
  const selectedBackground = isSelected ? { 'background': 'linear-gradient(180deg, #93F5E1 0%, #C6F7ED 100%)' } : {};
  return (
    <Box
      sx={{
        width: '315px',
        borderRadius: '8px',
        padding: '16px',
        border: '1px solid var(--grayscale-200, #DCE0E9)',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        ...selectedBackground,
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }} onClick={onSelect}>
        {/*  @ts-ignore */}
        <Typography variant="body1">
          {intl.formatMessage(messages.dstAddr, { index })}
        </Typography>
        <IconWrapper icon={Icons.ChevronRight} />
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="body2" color="var(--text-gray-low, #6B7384)">
          {intl.formatMessage(messages.dstAddrLabel)}
        </Typography>
        {/*  @ts-ignore */}
        <CopyableText value={address} copyButtonFollowText>
          <Typography variant="body2">
            {shortenAddress(address)}
          </Typography>
        </CopyableText>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
       {/*  @ts-ignore */}
        <Typography variant="body2" color="var(--text-gray-low, #6B7384)">
          {intl.formatMessage(messages.status)}
        </Typography>

        {/*  @ts-ignore */}
        <Typography variant="body2">
          {statusString}
        </Typography>
      </Box>

     <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        {/*  @ts-ignore */}
        <Typography variant="body2" color="var(--text-gray-low, #6B7384)">
          {intl.formatMessage(messages.redeemable)}
        </Typography>

        {/*  @ts-ignore */}
        <Typography variant="body2">
        {redeemable}&nbsp;NIGHT
        </Typography>
      </Box>

     <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        {/*  @ts-ignore */}
        <Typography variant="body2" color="var(--text-gray-low, #6B7384)">
          {intl.formatMessage(messages.total)}
        </Typography>

        {/*  @ts-ignore */}
        <Typography variant="body2">
        {total}&nbsp;NIGHT
        </Typography>
      </Box>
    </Box>
  );
}

function shortenAddress(address: string): string {
  return `${address.slice(0, 8)}...${address.slice(-4)}`;
}
