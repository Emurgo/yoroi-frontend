//@flow
import type { Node } from 'react';
import { Box, Typography } from '@mui/material';
import Separator from '../separator/Separator';

type Props = {|
  columnNames: Array<string>,
  gridTemplateColumns: string,
  children: Node,
  rowGap?: string,
  columnGap?: string,
  columnAlignment?: Array<string>,
|};

export default function Table({
  children,
  rowGap,
  columnGap,
  columnAlignment = ['left'],
  columnNames,
  gridTemplateColumns,
}: Props): Node {
  return (
    <Box
      sx={{
        display: 'grid',
        rowGap: rowGap || '8px',
        columnGap: columnGap || '8px',
        gridTemplateColumns,
        alignItems: 'center',
      }}
    >
      {columnNames.map((name, i) => (
        <Typography
          variant="body2"
          key={name}
          textAlign={columnAlignment[i] ? columnAlignment[i] : 'right'}
          pt="13px"
          pb="5px" // 5px + 8px of gap = 13px
          pr={i === 0 ? '0' : '8px'}
          pl={i === 0 ? '8px' : '0px'}
          color="grayscale.600"
        >
          {name}
        </Typography>
      ))}
      <Separator sx={{ gridColumn: '1/-1', mb: '8px' }} />
      {children}
    </Box>
  );
}
