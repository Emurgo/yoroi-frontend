// @flow
import type { Node } from 'react';
import { Stack, Typography } from '@mui/material';
import { ReactComponent as NotFound }  from '../../../assets/images/assets-page/no-nft-found.inline.svg';

type Props = {|
  message: string,
|};
export const ListEmpty = ({ message }: Props): Node => {
  return (
    <Stack
      sx={{
        height: '90%',
        flex: '1',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      spacing={2}
    >
      <NotFound />
      <Typography variant="h3" color="var(--yoroi-palette-gray-900)">
        {message}
      </Typography>
    </Stack>
  );
};
