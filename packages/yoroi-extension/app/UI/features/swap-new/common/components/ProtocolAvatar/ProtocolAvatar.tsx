import { getDexUrlByProtocol } from '@yoroi/swap';
import { Swap } from '@yoroi/types';

import { ProtocolIcon } from '../ProtocolIcon/ProtocolIcon';
import { Link, Typography } from '@mui/material';

type Props = {
  protocol: Swap.Protocol;
  append?: string;
  onPress?: () => void;
  preventOpenLink?: boolean;
};

export const ProtocolAvatar = ({ protocol, append = '' }: Props) => {
  const formattedName = `${protocol.charAt(0).toUpperCase()}${protocol.slice(1).replace(/-/, ' ')}${append}`;

  return (
    <Link
      target="_blank"
      href={getDexUrlByProtocol(protocol)}
      rel="noopener noreferrer"
      sx={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
    >
      <ProtocolIcon protocol={protocol} size={18} />

      <Typography variant="body2" style={{ fontWeight: 500 }}>
        {formattedName}
      </Typography>
    </Link>
  );
};
