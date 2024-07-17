// @flow
import { Box } from '@mui/system';
import { observer } from 'mobx-react';
import type { Node, ComponentType } from 'react';

type Props = {|
  +children: Node,
  +isRevamp?: boolean,
|};

function BackgroundColoredLayout({ children, isRevamp = false }: Props): Node {
  return (
    <Box
      sx={{
        overflow: 'auto',
        height: '100%',
        padding: isRevamp ? 0 : '30px',
        backgroundColor: isRevamp ? 'ds.bg_color_low' : 'var(--yoroi-palette-gray-50)',
      }}
    >
      {children}
    </Box>
  );
}

export default (observer(BackgroundColoredLayout): ComponentType<Props>);
