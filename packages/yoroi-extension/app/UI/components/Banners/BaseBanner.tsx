import React from 'react';
import { Typography, styled, Button, Stack, ButtonProps, StackProps, useTheme } from '@mui/material';
import { IconWrapper, Icons } from '../icons';

const Container = styled(Stack)(({ theme }: any) => ({
  backgroundImage: theme.palette.ds.bg_gradient_1,
  borderRadius: '8px',
  minHeight: '154px',
  marginBottom: '16px',
  overflow: 'hidden',
}));

interface BaseBannerProps {
  onClose: () => void;
  title: string | React.ReactNode;
  description: string | React.ReactNode;
  buttonText?: string | React.ReactNode;
  buttonProps?: ButtonProps;
  illustration?: React.ReactNode;
  illustrationProps?: StackProps;
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
  const theme: any = useTheme();

  const handleClose = () => {
    onClose();
  };

  return (
    <Container direction="row" justifyContent="space-between" sx={{ position: 'relative', flex: 1 }}>
      <Stack sx={{ position: 'absolute', zIndex: 20, right: 10, top: 10 }}>
        <IconWrapper
          buttonProps={{ onClick: handleClose }}
          icon={Icons.CloseCircleIcon}
          color="ds.el_gray_max"
          borderColor="ds.el_gray_max"
          iconProps={{fill: theme.palette.ds.el_gray_max}}
          asButton
        />
      </Stack>
      <Stack direction="column" p="16px" alignItems="flex-start">
        {typeof title === 'string' ? (
          <Typography fontSize="16px" fontWeight={500} color="ds.gray_max">
            {title}
          </Typography>
        ) : (
          title
        )}
        <Typography variant="body1" mt="8px" mb={buttonText ? '24px' : '0px'} color="ds.gray_max">
          {description}
        </Typography>
        {buttonText && <Button {...buttonProps}>{buttonText}</Button>}
      </Stack>
      {displayIllustration && (
        <Stack height={125} {...illustrationProps}>
          {illustration}
        </Stack>
      )}
    </Container>
  );
};
