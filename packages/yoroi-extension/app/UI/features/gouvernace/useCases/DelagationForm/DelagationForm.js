// @flow
import * as React from 'react';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import type { Node } from 'react';

const DetailsContainer = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(4),
  textAlign: 'left',
  width: '100%',
  maxWidth: '500px',
  backgroundColor: theme.palette.background.paper,
  padding: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[1],
}));

const TotalBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  padding: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  marginBottom: theme.spacing(2),
}));

const TransactionDetails = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.default,
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[1],
  marginBottom: theme.spacing(2),
}));

const PasswordField = styled(TextField)(({ theme }) => ({
  marginTop: theme.spacing(2),
}));

export const DelagationForm = (): Node => {
  return (
    <DetailsContainer>
      <Typography variant="h6" gutterBottom>
        Delegate to a DRep
      </Typography>
      <Typography variant="body2" gutterBottom>
        You are designating someone else to cast your vote on your behalf for all proposals now and
        in the future.
      </Typography>
      <TotalBox>
        <Typography variant="h6">Total</Typography>
        <Box textAlign="right">
          <Typography variant="h6">0.5 ADA</Typography>
          <Typography variant="body2">0.15 USD</Typography>
        </Box>
      </TotalBox>
      <Typography variant="h6" gutterBottom>
        Transaction Details
      </Typography>
      <TransactionDetails>
        <Typography variant="body2" gutterBottom>
          Operations
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Delegate voting to drep1e93a2zvs3aw8e4naez0ynpmc48jbc7yaa3n2k8ljhwfdt70yscts
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Transaction fee: 0.5 ADA
        </Typography>
      </TransactionDetails>
      <PasswordField label="Password" type="password" variant="outlined" fullWidth />
    </DetailsContainer>
  );
};
