// @flow
import type { Node } from 'react';
import { useState } from 'react';
import { Box, Button, Typography } from '@mui/material';
import Dialog from '../widgets/Dialog/Dialog';
import CheckboxLabel from '../common/CheckboxLabel';

type Props = {|
  onDialogConfirm: () => void,
  onDialogRefuse: () => void,
|};

export default function SwapDisclaimerDialog({
  onDialogConfirm,
  onDialogRefuse,
}: Props): Node {
  const [isCheckboxMarked, setCheckboxMarked] = useState(false);
  return (
    <Dialog title="Swap Disclaimer" onClose={onDialogRefuse}>
      <Box display="flex" maxWidth="648px" mt="-24px" flexDirection="column" gap="24px">
        <Box>
          <Typography component="div" variant="body1" color="grayscale.900" align="justify">
            Please be aware that by proceeding to use the SWAP functionality within Yoroi,
            you acknowledge and understand that any actions taken are solely your responsibility.
            <br /><br />
            The assets available in this functionality are Cardano Native Assets and not subject
            to a verification process. Additionally, the asset price indication is subject to rapid
            fluctuations based on market conditions.
            <br /><br />
            We strongly advise conducting thorough research and exercising caution before engaging in any
            SWAP transactions. Yoroi and EMURGO cannot be held liable for any potential risks, losses,
            or damages that may arise from your use of the SWAP functionality.
          </Typography>
        </Box>
        <CheckboxLabel
          label="I understand this disclaimer"
          onChange={() => setCheckboxMarked(!isCheckboxMarked)}
          checked={isCheckboxMarked}
          labelSx={{ fontWeight: 400, marginLeft: '-8px' }}
        />
      </Box>
      <Box maxWidth="648px" display="flex" gap="24px" pt="24px">
        <Button
          fullWidth
          variant="primary"
          onClick={onDialogConfirm}
          disabled={!isCheckboxMarked}
        >
          Confirm
        </Button>
      </Box>
    </Dialog>
  );
}
