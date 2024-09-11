import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import React from 'react';
import { Icon } from '../../../../components';

interface Props {
  variant?: 'danger' | 'success' | 'neutral';
  withIcon?: boolean;
  children: React.ReactNode;
  style?: React.CSSProperties;
}



const PnlTag = ({ children, withIcon = false, variant = 'neutral', style, ...etc }: Props) => {
  // const theme = useTheme();

  const icon = variant === 'danger' ? <Icon.ChipArrowDown fill="red" /> : <Icon.ChipArrowUp />;

  return (
    <TagContainer mode={variant} style={style} {...etc}>
      {withIcon && variant !== 'neutral' && icon}
      <StyledTypography mode={variant}>{children}</StyledTypography>
    </TagContainer>
  );
};

const TagContainer = styled(Box, {
  shouldForwardProp: prop => prop !== 'mode',
})<{
  mode: 'danger' | 'success' | 'neutral';
}>(({ theme, mode }) => ({
  height: '25px',
  display: 'flex',
  alignItems: 'center',
  borderRadius: '999px',
  padding: '4px 6px',
  backgroundColor: getBackgroundColor(theme, mode),
}));

const StyledTypography = styled(Typography, {
  shouldForwardProp: prop => prop !== 'mode',
})<{
  mode: 'danger' | 'success' | 'neutral';
}>(({ theme, mode }) => ({
  //   ...theme.typography.body2,
  color: getTextColor(theme, mode),
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
      return theme.palette.ds.secondary_700;
    case 'danger':
      return theme.palette.ds.sys_magenta_700;
    default:
      return theme.palette.ds.gray_600;
  }
};

export default PnlTag;
