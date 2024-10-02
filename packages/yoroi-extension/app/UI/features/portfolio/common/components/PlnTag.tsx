import { Box, Typography, styled } from '@mui/material';
import React from 'react';
import { Icon } from '../../../../components';

interface Props {
  variant?: 'danger' | 'success' | 'neutral';
  withIcon?: boolean;
  children: React.ReactNode;
  style?: React.CSSProperties;
}

const IconWrapper: any = styled(Box)(({ theme, mode }: any) => ({
  height: '16px',
  '& svg': {
    '& path': {
      fill: mode === 'success' ? theme.palette.ds.secondary_800 : theme.palette.ds.sys_magenta_700,
    },
  },
}));

const PnlTag = ({ children, withIcon = false, variant = 'neutral' }: Props) => {
  const icon =
    variant === 'danger' ? (
      <IconWrapper mode={variant}>
        <Icon.ChipArrowDown />
      </IconWrapper>
    ) : variant === 'success' ? (
      <IconWrapper mode={variant}>
        <Icon.ChipArrowUp />
      </IconWrapper>
    ) : (
      <></>
    );

  return (
    <TagContainer mode={variant}>
      {withIcon && variant !== 'neutral' && icon}
      <StyledTypography mode={variant} fontSize="12px">
        {children}
      </StyledTypography>
    </TagContainer>
  );
};

const TagContainer: any = styled(Box, {
  shouldForwardProp: prop => prop !== 'mode',
})(({ theme, mode }: any) => ({
  height: '25px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '20px',
  padding: '4px 7px',
  backgroundColor: getBackgroundColor(theme, mode),
  width: 'auto',
}));

const StyledTypography: any = styled(Typography, {
  shouldForwardProp: prop => prop !== 'mode',
})(({ theme, mode }: any) => ({
  color: getTextColor(theme, mode),
  fontSize: '12px',
}));

const getBackgroundColor = (theme, mode) => {
  switch (mode) {
    case 'success':
      return theme.palette.ds.secondary_100;
    case 'danger':
      return theme.palette.ds.sys_magenta_100;
    default:
      return theme.palette.ds.gray_100;
  }
};

const getTextColor = (theme, mode) => {
  switch (mode) {
    case 'success':
      return theme.palette.ds.secondary_800;
    case 'danger':
      return theme.palette.ds.sys_magenta_700;
    default:
      return theme.palette.ds.gray_600;
  }
};

export default PnlTag;
