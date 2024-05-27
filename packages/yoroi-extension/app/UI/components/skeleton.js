import { Skeleton as MuiSkeleton } from '@mui/material';
import { useTheme } from '@mui/material/styles';

export const Skeleton = props => {
  const theme = useTheme();

  return (
    <MuiSkeleton
      variant="rectangular"
      animation={false}
      {...props}
      sx={{ borderRadius: `${theme.shape.borderRadius}px`, ...props.sx }}
    />
  );
};
