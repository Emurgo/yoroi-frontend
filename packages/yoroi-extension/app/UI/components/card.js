import { Box, styled } from '@mui/material';

export const Card = styled(Box)(({ theme }) => ({
  borderRadius: '8px',
  flex: '1 1 100%',
  display: 'flex',
  flexDirection: 'column',
  border: '1px solid',
  borderColor: theme.palette.grayscale['200'],
  bgcolor: 'background.card',
}));
