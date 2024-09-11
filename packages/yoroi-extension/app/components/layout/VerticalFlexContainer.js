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
        overflowY: 'auto',
        position: 'relative',
        '&::-webkit-scrollbar-button': {
          height: '7px',
          display: 'block',
        },
        backgroundColor: 'ds.bg_color_max',
      }}
    >
      {children}
    </Box>
  );
}
export default (observer(VerticalFlexContainer): ComponentType<Props>);
