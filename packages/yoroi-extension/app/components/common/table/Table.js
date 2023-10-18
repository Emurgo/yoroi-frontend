import type { Node } from 'react';
import { Box, Typography } from '@mui/material';
import Separator from '../separator/Separator';

type Props = {|
  columnNames: Array<string>,
  gridTemplateColumns: string,
  children: Node,
|};

export default function Table({ children, columnNames, gridTemplateColumns }: Props): Node {
  return (
    <Box
      sx={{
        display: 'grid',
        rowGap: '8px',
        gridTemplateColumns,
        alignItems: 'center',
      }}
    >
      {columnNames.map((name, i) => (
        <Typography
          variant="body2"
          key={name}
          textAlign={i === 0 ? 'left' : 'right'}
          pt="13px"
          pb="5px" // 5px + 8px of gap = 13px
          pr={i === 0 ? '0' : '8px'}
          color="grayscale.600"
        >
          {name}
        </Typography>
      ))}
      <Separator sx={{ gridColumn: '1/-1' }} />
      {children}
    </Box>
  );
}
