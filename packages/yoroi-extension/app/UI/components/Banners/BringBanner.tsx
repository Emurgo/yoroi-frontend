import React from 'react';
import { IconButton, Typography, styled, Button, Stack } from '@mui/material';
import { Cashback } from '../ilustrations/Cashback';
import { Icon } from '../icons';
import { useStrings } from '../../common/hooks/useStrings';

const Container = styled(Stack)(({ theme }: any) => ({
  backgroundImage: theme.palette.ds.bg_gradient_1,
  borderRadius: '8px',
  height: '154px',
  marginBottom: '16px',
  overflow: 'hidden',
}));

const IconWrapper = styled(IconButton)(({ theme }: any) => ({
  borderColor: theme.palette.ds.el_gray_max,
  color: theme.palette.ds.el_gray_max,
  cursor: 'pointer',
}));

interface BringBannerProps {
  onClose: () => void;
  onClick: () => void;
}

export const BringBanner = ({ onClose, onClick }: BringBannerProps) => {
  const { bringBannerButton, bringBannerTitle, bringBannerDesc } = useStrings();

  const handleClose = () => {
    onClose();
  };

  const handleClick = () => {
    onClick();
  };

  return (
    <Container direction="row" justifyContent="space-between" sx={{ position: 'relative' }}>
      <Stack sx={{ position: 'absolute', zIndex: 20, right: 10, top: 10 }}>
        <IconWrapper onClick={handleClose}>
          <Icon.CloseIcon />
        </IconWrapper>
      </Stack>
      <Stack direction="column" p="16px" alignItems="flex-start">
        <Typography fontSize="16px" fontWeight={500} color="ds.gray_max">
          {bringBannerTitle}
        </Typography>
        <Typography variant="body1" mt="8px" mb="24px" color="ds.gray_max">
          {bringBannerDesc}
        </Typography>
        <Button
          //  @ts-ignore
          variant="contained"
          sx={{
            width: 'fit-content',
            height: '40px',
            '&.MuiButton-sizeMedium': {
              p: '9px 20px',
            },
          }}
          onClick={handleClick}
        >
          {bringBannerButton}
        </Button>
      </Stack>
      <Stack sx={{ position: 'relative', zIndex: 10, transform: 'scale(2)', marginTop: '25px', marginRight: '5px' }}>
        <Cashback />
      </Stack>
    </Container>
  );
};
