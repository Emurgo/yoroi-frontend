// @flow
import type { Node } from 'react';
import { Stack, Typography } from '@mui/material';
import { ReactComponent as NoTransactionModernSvg }  from '../../../assets/images/transaction/no-transactions-yet.modern.inline.svg';

type Props = {|
  message: string,
|};
export const ListEmpty = ({ message }: Props): Node => {
  return (
    <Stack
      sx={{
        height: '30vh',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '30px'
      }}
      spacing={2}
    >
      <NoTransactionModernSvg />
      <Typography component="div" variant="h3" color="var(--yoroi-palette-gray-900)">
        {message}
      </Typography>
    </Stack>
  );
};
