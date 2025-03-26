import React from 'react';
import { IconButton, Typography, styled, Button, Stack, ButtonProps, StackProps } from '@mui/material';
import { Icon } from '../icons';

const Container = styled(Stack)(({ theme }: any) => ({
  backgroundImage: theme.palette.ds.bg_gradient_1,
  borderRadius: '8px',
  minHeight: '154px',
  marginBottom: '16px',
  overflow: 'hidden',
}));

const IconWrapper = styled(IconButton)(({ theme }: any) => ({
  borderColor: theme.palette.ds.el_gray_max,
  color: theme.palette.ds.el_gray_max,
  cursor: 'pointer',
}));

interface BaseBannerProps {
  onClose: () => void;
  title: string | React.ReactNode;
  description: string | React.ReactNode;
  buttonText: string | React.ReactNode;
  buttonProps: ButtonProps;
  illustration: React.ReactNode;
  illustrationProps: StackProps;
  displayIllustration?: boolean;
}

export const BaseBanner = ({
  onClose,
  title,
  description,
  buttonText,
  buttonProps,
  illustration,
  illustrationProps,
  displayIllustration = true,
}: BaseBannerProps) => {
  const handleClose = () => {
    onClose();
  };

  return (
    <Container direction="row" justifyContent="space-between" sx={{ position: 'relative', flex: 1 }}>
      <Stack sx={{ position: 'absolute', zIndex: 20, right: 10, top: 10 }}>
        <IconWrapper onClick={handleClose}>
          <Icon.CloseCircleIcon />
        </IconWrapper>
      </Stack>
      <Stack direction="column" p="16px" alignItems="flex-start">
        <Typography fontSize="16px" fontWeight={500} color="ds.gray_max">
          {title}
        </Typography>
        <Typography variant="body1" mt="8px" mb="24px" color="ds.gray_max">
          {description}
        </Typography>
        <Button {...buttonProps}>{buttonText}</Button>
      </Stack>
      {displayIllustration && <Stack height={125} {...illustrationProps}>{illustration}</Stack>}
    </Container>
  );
};
