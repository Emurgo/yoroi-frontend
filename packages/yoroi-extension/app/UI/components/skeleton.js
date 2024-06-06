// @flow
import { Skeleton as MuiSkeleton } from '@mui/material';
import type { SxProps } from '@mui/material';
import { useTheme } from '@mui/material/styles';

interface Props {
  sx: SxProps;
}

export const Skeleton = ({ sx, ...props }: Props): Node => {
  const theme = useTheme();

  return (
    <MuiSkeleton
      variant="rectangular"
      animation={false}
      {...props}
      sx={{
        borderRadius: `${theme.shape.borderRadius}px`,
        backgroundColor: theme.palette.ds.gray_c100,
        opacity: 0.8,
        ...sx,
      }}
    />
  );
};
