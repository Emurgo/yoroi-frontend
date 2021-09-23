// @flow
import type { Node } from 'react';
import { Tooltip as MuiTooltip } from '@mui/material';

/**
 * @deprecated in favor of MUI Tooltip, this unnecesary props needs to be removed
 * - isOpeningUpward
 * - tooltipOpensUpward
 */

function Tooltip(props: Object): Node {
  return (
    <MuiTooltip
      placement={
        props.isOpeningUpward
          ? `top${props.tooltipOpensUpward ? '-start' : ''}`.trim()
          : `bottom${props.tooltipOpensUpward ? '-start' : ''}`.trim()
      }
      {...props}
    />
  );
}

export default Tooltip;
