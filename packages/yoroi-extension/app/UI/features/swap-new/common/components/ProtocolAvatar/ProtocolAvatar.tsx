import { getDexUrlByProtocol } from '@yoroi/swap';
import { Swap } from '@yoroi/types';

import { Box, Link, Typography } from '@mui/material';

import { ProtocolIcon } from '../ProtocolIcon/ProtocolIcon';

type Props = {
  protocol: Swap.Protocol;
  append?: string;
  onPress?: () => void;
  preventOpenLink?: boolean;
};

export const ProtocolAvatar = ({ protocol, append = '', onPress, preventOpenLink = false }: Props) => {
  const formattedName = `${protocol.charAt(0).toUpperCase()}${protocol.slice(1).replace(/-/g, ' ')}${append}`;

  const content = (
    <>
      <ProtocolIcon protocol={protocol} size={18} />
      <Typography variant="body2" sx={{ fontWeight: 500 }}>
        {formattedName}
      </Typography>
    </>
  );

  if (preventOpenLink) {
    return (
      <Box
        component="button"
        type="button"
        onClick={onPress}
        aria-label={formattedName}
        sx={{
          textDecoration: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          cursor: 'pointer',
          background: 'none',
          border: 0,
          p: 0,
          m: 0,
          font: 'inherit',
          color: 'inherit',
        }}
      >
        {content}
      </Box>
    );
  }

  return (
    <Link
      target="_blank"
      href={getDexUrlByProtocol(protocol)}
      rel="noopener noreferrer"
      sx={{
        textDecoration: 'none',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
      }}
      aria-label={formattedName}
    >
      {content}
    </Link>
  );
};
