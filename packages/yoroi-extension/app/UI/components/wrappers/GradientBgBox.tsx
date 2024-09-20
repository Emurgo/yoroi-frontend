import { styled } from '@mui/material';

// For some reason the garatients are working only in styled components- and not in sx props
const GradientBgBox = styled(Box)(({ theme, variant }: { theme: any; variant: '1' | '2' | '3' }) => ({
  backgroundImage: `theme.palette.ds.bg_gradient_${variant}`,
}));
