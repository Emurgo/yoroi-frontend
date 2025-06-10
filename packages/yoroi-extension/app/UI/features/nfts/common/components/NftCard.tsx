import { Box, Typography } from '@mui/material';
import NftImage from './NftImage';

interface NftCardProps {
  ipfsUrl: string | undefined;
  name: string;
  onClick: () => void;
  nftPathId: string;
}

export default function NftCard({ ipfsUrl, name, onClick, nftPathId }: NftCardProps) {
  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', cursor: 'pointer' }} onClick={onClick} id={`${nftPathId}-component-button`}>
      <Box sx={{ borderRadius: '4px', overflow: 'hidden', flex: '1 1 auto' }}>
        <NftImage imageUrl={ipfsUrl} name={name} width="100%" height="100%" nftPathId={nftPathId} />
      </Box>
      <Box>
        <Typography
          component="div"
          mt="16px"
          sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
          color="ds.gray_900"
          id={`${nftPathId}-name-text`}
        >
          {name}
        </Typography>
      </Box>
    </Box>
  );
}
