import React from 'react';
import { Box, Typography } from '@mui/material';
import NftImage from './NftImage';

interface NftCardProps {
  ipfsUrl: string | null;
  name: string;
}

export default function NftCard({ ipfsUrl, name }: NftCardProps) {
  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
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
