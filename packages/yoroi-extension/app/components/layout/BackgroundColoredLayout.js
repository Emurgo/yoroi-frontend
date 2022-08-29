// @flow
import type { Node, ComponentType } from 'react';
import { observer } from 'mobx-react';
import { Box } from '@mui/system';

type Props = {|
  +children: Node,
|};

function BackgroundColoredLayout({ children }: Props): Node {
  return (
    <Box
      sx={{
        overflow: 'auto',
        height: '100%',
        padding: '30px',
        background: 'var(--yoroi-palette-gray-50)',
      }}
    >
      {children}
    </Box>
  );
}

export default (observer(BackgroundColoredLayout): ComponentType<Props>);
