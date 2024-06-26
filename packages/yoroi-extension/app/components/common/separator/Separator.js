//@flow
import { Box } from '@mui/material';

type Props = {|
  sx?: any,
|};

export default function Separator({ sx }: Props): React$Node {
  return <Box width="100%" height="1px" bgcolor="grayscale.200" sx={sx} />;
}
