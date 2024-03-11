//@flow

import type { Node } from 'react';
import { Box } from '@mui/material';
import { ReactComponent as ErrorTriangleIcon } from '../../assets/images/revamp/error.triangle.svg';
import { ReactComponent as ExclamationCircleIcon } from '../../assets/images/revamp/exclamation.circle.svg';

type Props = {|
  isSevere: boolean,
  small?: boolean,
|};

export default function PriceImpactIcon({ isSevere, small }: Props): Node {
  const sz = `${small ? 16 : 24}px`;
  const marginTop = `${small ? -2 : 0}px`;
  const marginRight = `6px`;
  const svgProp = small ? {
    style: { transform: 'scale(0.666666666)' },
  } : {};
  return <Box
    sx={{ width: sz, height: sz, marginTop, marginRight }}
  >
    {isSevere
      ? <ErrorTriangleIcon {...svgProp} />
      : <ExclamationCircleIcon {...svgProp} />}
  </Box>
}