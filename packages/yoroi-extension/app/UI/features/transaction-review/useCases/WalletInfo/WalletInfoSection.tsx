import { Box, Stack, Typography, styled } from '@mui/material';
import React from 'react';
import WalletAccountIcon from '../../../../components/WalletAccountIcon/WalletAccountIcon';
import { useTxReviewModal } from '../../module/ReviewTxProvider';

export const WalletInfoSection = () => {
  const { currentWalletDetails } = useTxReviewModal();
  const { selected, selectedWalletName } = currentWalletDetails;

  const { plate } = selected;
  return (
    <Stack p="24px">
      <Stack alignItems="center" justifyContent="">
        <Box sx={{ borderRadius: '8px' }}>
          <WalletAccountIcon iconSeed={plate.ImagePart} size={20} />
        </Box>
        <Typography variant="h5" mt="8px" fontWeight={500}>
          {selectedWalletName}
        </Typography>
        <Typography variant="body1" color="ds.text_gray_low">
          {plate.TextPart}
        </Typography>
      </Stack>
      <WalletStats />
    </Stack>
  );
};

const StyledStack = styled(Stack)(({ theme }: any) => ({
  background: theme.palette.ds.bg_gradient_3,
  borderRadius: '9px',
}));

const WalletStats = () => {
  return (
    <StyledStack p="16px" my="16px" direction="column">
      <Stack direction="row" justifyContent="space-between" mb="19px">
        <Typography variant="caption" color="ds.white_static">
          Total wallet value
        </Typography>
        <Typography variant="body2" color="ds.white_static">
          1 ADA = 0.48 USD
        </Typography>
      </Stack>
      <Stack direction="row" alignItems="flex-end">
        <Typography variant="h2" fontWeight={500} color="ds.white_static">
          10000
        </Typography>
        <Typography variant="body1" fontWeight={500} color="ds.white_static">
          Ada
        </Typography>
      </Stack>
      <Stack direction="row" justifyContent="space-between" mt="2px">
        <Typography color="ds.white_static">300 USD</Typography>
        <Typography color="ds.white_static">PLN tag here</Typography>
      </Stack>
    </StyledStack>
  );
};
