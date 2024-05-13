//@flow
import type { Node } from 'react';
import { Box, Typography } from '@mui/material';
import Separator from '../separator/Separator';

type Props = {|
  columnKeys?: Array<string>,
  columnNames: Array<string>,
  gridTemplateColumns: string,
  children: Node,
  rowGap?: string,
  columnGap?: string,
  columnAlignment?: Array<string>,
  columnLeftPaddings?: Array<string>,
  columnRightPaddings?: Array<string>,
|};

export default function Table({
  children,
  rowGap,
  columnGap,
  columnKeys,
  columnNames,
  gridTemplateColumns,
  columnAlignment = ['left'],
  columnLeftPaddings = ['8px'],
  columnRightPaddings = ['0px'],
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
          component="div"
          variant="body2"
          key={columnKeys?.[i] ?? name}
          textAlign={columnAlignment[i] ? columnAlignment[i] : 'right'}
          pt="13px"
          pb="5px" // 5px + 8px of gap = 13px
          pr={columnRightPaddings[i] ? columnRightPaddings[i] : '8px'}
          pl={columnLeftPaddings[i] ? columnLeftPaddings[i] : '0px'}
          color="grayscale.600"
        >
          {name}
        </Typography>
      ))}
      {columnNames.length > 0 && <Separator sx={{
        gridColumn: '1/-1',
        mb: '8px'
      }}/>}
      {children}
    </Box>
  );
}
