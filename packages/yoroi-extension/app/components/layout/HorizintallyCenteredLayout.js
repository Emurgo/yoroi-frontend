// @flow
import type { Node, ComponentType } from 'react';
import { observer } from 'mobx-react';
import { Box } from '@mui/system';

type Props = {|
  +children: Node,
|};

function HorizontallyCenteredLayout({ children }: Props): Node {
  return (
    <Box
      sx={{
        position: 'relative',
        left: '50%',
        transform: 'translateX(-50%)',
        margin: 'auto',
      }}
    >
      {children}
    </Box>
  );
}
export default (observer(HorizontallyCenteredLayout): ComponentType<Props>);
