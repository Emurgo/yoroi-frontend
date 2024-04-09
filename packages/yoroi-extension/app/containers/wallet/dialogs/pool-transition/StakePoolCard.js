// @flow
import React from 'react';
import { Card, CardContent, Typography, Icon, Grid, Alert, styled, Paper } from '@mui/material';

type Props = {|
  label: string,
  poolName: string,
  roa: string,
  fee: string,
  deadline: string,
|};

export const StakePoolCard = ({ label, poolName, roa, fee, deadline }: Props): React$Node => {
  return (
    <CustomCard>
      <CardContent>
        <Typography variant="subtitle1">{poolName}</Typography>
        <Typography variant="body2">Estimated ROA {roa}</Typography>
        <Typography variant="body2">Fee {fee}</Typography>
        {deadline && <Alert severity="warning">{deadline}</Alert>}
      </CardContent>
    </CustomCard>
  );
};

const CustomCard = styled(Card)(({ theme }) => ({
  // Add your custom styles here
  margin: theme.spacing(2),
  padding: theme.spacing(2),
  boxShadow: '0 3px 5px 2px rgba(0, 0, 0, .3)',
  borderRadius: 8,
  maxWidth: '284px',
}));
