import React from 'react';
import { Box, Avatar, useTheme as useMuiTheme } from '@mui/material';
import { isPrimaryToken } from '@yoroi/portfolio';
import { Portfolio } from '@yoroi/types';
import { Icons, IconWrapper } from '../../../../../components';
import { usePortfolioImage } from '../../../../portfolio/common/hooks/usePortfolioImage';

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
  const theme = useMuiTheme();
  const dimension = sizeMap[size];
  // console.log('TokenInfoIcon', info);
  const [policy, name] = !info || info.policy === '.' ? ['.', '.'] : info.id.split('.');
  const { uri, headers, onError, onLoad, isError } = usePortfolioImage({ policy, name, width: 64, height: 64 });

  if (!info || isError) {
    return (
      <Box
        sx={{
          width: dimension,
          height: dimension,
          bgcolor: theme.palette.grey[200],
          borderRadius: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          ...imageStyle,
        }}
      >
        <IconWrapper icon={Icons.Assets1} />
        {/* < color={theme.palette.grey[600]} size={dimension - 6} /> */}
      </Box>
    );
  }

  if (isPrimaryToken(info)) {
    return (
      <Box
        sx={{
          width: dimension,
          height: dimension,
          bgcolor: theme.palette.primary.main,
          borderRadius: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          ...imageStyle,
        }}
      >
        <IconWrapper icon={Icons.Assets} />
      </Box>
    );
  }

  return (
    <Avatar
      src={uri}
      alt={info.name ?? ''}
      sx={{
        width: dimension,
        height: dimension,
        borderRadius: 1,
        ...imageStyle,
      }}
      onLoad={onLoad}
      onError={onError}
      imgProps={{ crossOrigin: 'anonymous' }}
    />
  );
};
