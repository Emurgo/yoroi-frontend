// @flow
import type { Node, ComponentType } from 'react';
import { observer } from 'mobx-react';
import { Box } from '@mui/system';

type Props = {|
  +children: Node,
|};

function VerticallyCenteredLayout({ children }: Props): Node {
  return (
    <Box
      sx={{
        position: 'relative',
        top: '50%',
        transform: 'translateY(-50%)',
        margin: 'auto',
      }}
    >
      {children}
    </Box>
  );
}
export default (observer(VerticallyCenteredLayout): ComponentType<Props>);
