// @flow
import { Box } from '@mui/material';
import type { Node } from 'react';

export function Divider(): Node {
  return <Box sx={{ width: '100%', height: '1px', backgroundColor: 'grayscale.200' }} />;
}
