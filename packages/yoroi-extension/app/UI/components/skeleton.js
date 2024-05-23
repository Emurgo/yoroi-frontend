import { Skeleton } from '@mui/material';
import { useTheme } from '@mui/material/styles';

export const StyledSkeleton = props => {
  const theme = useTheme();

  return (
    <Skeleton
      variant="rectangular"
      animation={false}
      {...props}
      sx={{ borderRadius: `${theme.shape.borderRadius}px`, ...props.sx }}
    />
  );
};
