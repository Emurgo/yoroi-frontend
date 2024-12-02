// @flow
import type { Node } from 'react';
import { Box, Button, Typography } from '@mui/material';
import { useState } from 'react';
import { useStrings } from '../../containers/swap/common/useStrings';
import CheckboxLabel from '../common/CheckboxLabel';
import Dialog from '../widgets/Dialog';

type Props = {|
  onDialogConfirm: () => void,
  onDialogRefuse: () => void,
|};

export default function SwapDisclaimerDialog({ onDialogConfirm, onDialogRefuse }: Props): Node {
  const [isCheckboxMarked, setCheckboxMarked] = useState(false);
  const strings = useStrings();
  return (
    <Dialog
      title="Swap Disclaimer"
      onClose={onDialogRefuse}
      styleOverride={{ width: '648px', height: '504px' }}
      styleContentOverride={{ paddingTop: '0px' }}
    >
      <Box display="flex" maxWidth="648px" flexDirection="column" gap="24px">
        <Box>
          <Typography component="div" variant="body1" color="grayscale.900" align="justify">
            {strings.swapDisclamerInfo}
          </Typography>
        </Box>
        <CheckboxLabel
          label={strings.swapDisclamerButton}
          onChange={() => setCheckboxMarked(!isCheckboxMarked)}
          checked={isCheckboxMarked}
          labelSx={{ fontWeight: 400, marginLeft: '-8px' }}
        />
      </Box>
      <Box maxWidth="648px" display="flex" gap="24px" pt="24px">
        <Button fullWidth variant="primary" onClick={onDialogConfirm} disabled={!isCheckboxMarked}>
          {strings.confirm}
        </Button>
      </Box>
    </Dialog>
  );
}
