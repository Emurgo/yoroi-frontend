import React from 'react';
import { Box, Typography } from '@mui/material';
import NftImage from './NftImage';

interface NftCardProps {
  ipfsUrl: string | null;
  name: string;
  onClick: () => void;
}

export default function NftCard({ ipfsUrl, name, onClick }: NftCardProps) {
  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', cursor: 'pointer' }} onClick={onClick}>
      <Box sx={{ borderRadius: '4px', overflow: 'hidden', flex: '1 1 auto' }}>
        <NftImage imageUrl={ipfsUrl} name={name} width="100%" height="100%" />
      </Box>
      <Box>
        <Typography
          component="div"
          mt="16px"
          sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
          color="ds.gray_900"
        >
          {name}
        </Typography>
      </Box>
    </Box>
  );
}
