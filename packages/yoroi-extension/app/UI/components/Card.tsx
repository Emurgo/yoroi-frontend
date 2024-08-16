import React from 'react';
import { Box, styled } from '@mui/material';

const StyledCard = styled(Box)(({ theme }: any) => ({
  borderRadius: `${theme.shape.borderRadius}px`,
  flex: '1 1 100%',
  display: 'flex',
  flexDirection: 'column',
  border: '1px solid',
  borderColor: theme.palette.ds.gray_200,
}));

export const Card = props => {
  return <StyledCard {...props} />;
};
