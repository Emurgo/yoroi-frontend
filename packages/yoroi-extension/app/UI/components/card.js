// @flow
import { Box, styled } from '@mui/material';

const StyledCard = styled(Box)(({ theme }) => ({
  borderRadius: '8px',
  flex: '1 1 100%',
  display: 'flex',
  flexDirection: 'column',
  border: '1px solid',
  borderColor: theme.palette.ds.gray_c200,
}));

export const Card = props => {
  return <StyledCard {...props} />;
};
