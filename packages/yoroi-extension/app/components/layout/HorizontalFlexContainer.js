// @flow
import type { Node, ComponentType } from 'react';
import { observer } from 'mobx-react';
import { Box } from '@mui/system';

type Props = {|
  +children: ?Node,
|};

function HorizontalFlexContainer({ children }: Props): Node {
  return (
    <Box
      sx={{
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        position: 'relative',
        '&::-webkit-scrollbar-button': {
          width: '7px',
          display: 'block',
        },
      }}
    >
      {children}
    </Box>
  );
}
export default (observer(HorizontalFlexContainer): ComponentType<Props>);
