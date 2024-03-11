// @flow
import type { Node } from 'react';
import { Box, Button, Typography } from '@mui/material';
import Dialog from '../widgets/Dialog';

type Props = {|
  onContinue(): void,
  onCancel(): void,
|};

export default function PriceImpactAlert({
  onContinue,
  onCancel,
}: Props): Node {

  return (
    <Dialog title="Warning" onClose={onCancel} withCloseButton closeOnOverlayClick>
      <Box display="flex" maxWidth="648px" mt="-24px" flexDirection="column" gap="24px">
        <Typography component="div" variant="body1" color="grayscale.900">
          <Typography component="span" fontWeight="500">
            Price impact over 10%&nbsp;
          </Typography>
          may cause a significant loss of funds. Please bear this in mind and proceed with an extra caution.
        </Typography>
      </Box>
      <Box maxWidth="648px" display="flex" gap="24px" pt="24px">
        <Button fullWidth variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button fullWidth variant="primary" onClick={onContinue} sx={{ backgroundColor: 'magenta.500' }}>
          Continue
        </Button>
      </Box>
    </Dialog>
  );
}
