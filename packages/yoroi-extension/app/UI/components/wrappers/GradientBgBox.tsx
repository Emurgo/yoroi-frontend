import { styled, Box } from '@mui/material';

// For some reason the garatients are working only in styled components- and not in sx props
export const GradientBgBox = styled(Box)(({ variant }: { variant: '1' | '2' | '3' }) => ({
  backgroundImage: `theme.palette.ds.bg_gradient_${variant}`,
}));
