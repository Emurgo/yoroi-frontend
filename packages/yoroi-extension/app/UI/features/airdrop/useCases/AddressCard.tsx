import { Box, Typography } from '@mui/material';
import { type Status } from '../../../../api/ada/midnightRedemption';
import CopyableText from '../../../components/CopyableText';
import { IconWrapper, Icons } from '../../../components';
import { useStrings } from '../common/hooks/useStrings';

export function AddressesTitle({ count }: { count: number }) {
  const strings = useStrings();
  return (
    /*  @ts-ignore */
    <Typography variant="heading-4-regular" sx={{ fontWeight: 500, fontSize: '20px', lineHeight: '28px' }} as="div">
      {strings.dstAddrs(count)}
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
  const strings = useStrings();
  const statusString =
    {
      ready: strings.statusReady,
      notReady: strings.statusNotReady,
    }[status] || '';

  const selectedBackground = isSelected ? { background: 'linear-gradient(180deg, #93F5E1 0%, #C6F7ED 100%)' } : {};
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
        cursor: 'pointer',
      }}
      onClick={event => {
        //hack: detect that the copy address icon is clicked
        if ((event.target as HTMLElement).tagName === 'svg') {
          return;
        }
        onSelect();
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        {/*  @ts-ignore */}
        <Typography variant="body1">{strings.dstAddr(index)}</Typography>
        <IconWrapper icon={Icons.ChevronRight} />
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="body2" color="var(--text-gray-low, #6B7384)">
          {strings.dstAddrLabel}
        </Typography>
        {/*  @ts-ignore */}
        <CopyableText value={address} copyButtonFollowText>
          <Typography variant="body2">{shortenAddress(address)}</Typography>
        </CopyableText>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        {/*  @ts-ignore */}
        <Typography variant="body2" color="var(--text-gray-low, #6B7384)">
          {strings.status}
        </Typography>

        {/*  @ts-ignore */}
        <Typography variant="body2">{statusString}</Typography>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        {/*  @ts-ignore */}
        <Typography variant="body2" color="var(--text-gray-low, #6B7384)">
          {strings.redeemable}
        </Typography>

        {/*  @ts-ignore */}
        <Typography variant="body2">{redeemable}&nbsp;NIGHT</Typography>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        {/*  @ts-ignore */}
        <Typography variant="body2" color="var(--text-gray-low, #6B7384)">
          {strings.total}
        </Typography>

        {/*  @ts-ignore */}
        <Typography variant="body2">{total}&nbsp;NIGHT</Typography>
      </Box>
    </Box>
  );
}

function shortenAddress(address: string): string {
  return `${address.slice(0, 8)}...${address.slice(-4)}`;
}
