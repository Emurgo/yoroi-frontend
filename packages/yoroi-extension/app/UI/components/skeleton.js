import { Skeleton } from '@mui/material';

export const StyledSkeleton = props => {
  return (
    <Skeleton
      variant="rectangular"
      animation={false}
      {...props}
      sx={{ borderRadius: '8px', ...props.sx }}
    />
  );
};
