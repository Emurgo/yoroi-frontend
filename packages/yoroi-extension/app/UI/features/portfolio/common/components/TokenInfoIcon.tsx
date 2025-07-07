import React, { useState } from 'react';
import { Box, styled, useTheme } from '@mui/material';

import { usePortfolioImage } from '../hooks/usePortfolioImage';
import { Icons, IconWrapper } from '../../../../components';

type TokenInfoIconProps = {
  info: any;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  imageStyle?: React.CSSProperties;
};

const sizeMap = {
  sm: 24,
  md: 32,
  lg: 40,
  xl: 80,
} as const;

export const TokenInfoIcon = ({ info, size = 'lg', imageStyle }: TokenInfoIconProps) => {
  const theme: any = useTheme();
  const dimension = sizeMap[size];
  const [fallback, setFallback] = useState(false);

  const id = typeof info?.id === 'string' ? info.id : '';
  const isAda = id === '' || id === '.';
  const [policy, name] = id.includes('.') ? id.split('.') : ['unknown', 'unknown'];

  const { uri, onError, onLoad, crossOrigin } = usePortfolioImage({
    policy,
    name,
    width: 64,
    height: 64,
  });

  if (!info?.id) {
    return (
      <StyledIconBox size={dimension} bg={theme.palette.ds.gray_200} style={imageStyle}>
        <IconWrapper icon={Icons.Assets} />
      </StyledIconBox>
    );
  }

  if (fallback || !uri) {
    return (
      <StyledIconBox size={dimension} bg={isAda ? theme.palette.ds.primary_500 : theme.palette.ds.gray_200} style={imageStyle}>
        <IconWrapper icon={isAda ? Icons.AdaToken : Icons.Assets} />
      </StyledIconBox>
    );
  }

  return (
    <Box
      component="img"
      src={uri}
      onLoad={onLoad}
      onError={() => {
        onError();
        setFallback(true);
      }}
      alt={name}
      crossOrigin={crossOrigin}
      sx={{
        width: dimension,
        height: dimension,
        borderRadius: 1,
        objectFit: 'cover',
        ...imageStyle,
      }}
    />
  );
};

const StyledIconBox = styled(Box, {
  shouldForwardProp: prop => prop !== 'size' && prop !== 'bg',
})<{ size: number; bg: string }>(({ size, bg }) => ({
  width: size,
  height: size,
  backgroundColor: bg,
  borderRadius: 8,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'hidden',
}));
