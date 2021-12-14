// @flow
import type { Node, ComponentType } from 'react';
import { observer } from 'mobx-react';
import { Box } from '@mui/system';

type Props = {|
  +children: ?Node,
|};

function VerticalFlexContainer({ children }: Props): Node {
  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'overlay',
        position: 'relative',
        '&::-webkit-scrollbar-button': {
          height: '7px',
          display: 'block',
        },
      }}
    >
      {children}
    </Box>
  );
}
export default (observer(VerticalFlexContainer): ComponentType<Props>);
