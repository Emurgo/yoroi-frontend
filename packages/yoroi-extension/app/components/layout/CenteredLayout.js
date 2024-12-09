// @flow
import type { Node, ComponentType } from 'react';
import { observer } from 'mobx-react';
import { Box } from '@mui/material';

type Props = {|
  +children: Node,
|};

function CenteredLayout({ children }: Props): Node {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'ds.bg_color_max',
        height: '100%',
      }}
    >
      {children}
    </Box>
  );
}
export default (observer(CenteredLayout): ComponentType<Props>);
