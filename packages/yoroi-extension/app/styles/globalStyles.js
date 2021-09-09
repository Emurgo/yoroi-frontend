// @flow
import type { Node } from 'react';
import { GlobalStyles } from '@mui/material';

const globalStyles = (theme: Object): Node => (
  <GlobalStyles
    styles={{
      ':root': {
        '--button-bg-color': theme.palette.secondary.main,
      },
    }}
  />
);

export { globalStyles };
