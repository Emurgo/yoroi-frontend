import { Box, Typography } from '@mui/material';
import { useIntl, defineMessages } from 'react-intl';
import type{ Schedule } from '../../../../api/ada/midnightRedemption';
import CopyableText from '../../../components/CopyableText';
//import { IconWrapper, Icons } from '../../../components';

const messages = defineMessages({
  details: {
    id: 'aidrop.addrDetail.detailsLabel',
    defaultMessage: '!!!More Midnight airdrop details',
  },
});

interface Props {
  address: string;
  schedule: Schedule;
}

export default function AddressDetails({ address, schedule }: Props) {
  const intl = useIntl();

  return (
    <Box>
      <CopyableText value={address} copyButtonFollowText>
        <Typography variant="body2">
          {address}
        </Typography>
      </CopyableText>
      <ScheduleCard schedule={schedule} />
      <hr />
      <Box>
        <Typography>
          {intl.formatMessage(messages.details)}
        </Typography>
      </Box>
    </Box>
  );
}

function ScheduleCard({ schedule }: { schedule: Schedule }) {
  return <pre>{JSON.stringify(schedule, null, 2)}</pre>;
}
