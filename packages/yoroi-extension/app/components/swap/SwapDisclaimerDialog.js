// @flow
import type { Node } from 'react';
import { Box, Typography, FormControlLabel, Checkbox } from '@mui/material';
import { useState } from 'react';
import { useStrings } from '../../containers/swap/common/useStrings';
import Dialog from '../widgets/Dialog';
import DialogCloseButton from '../widgets/DialogCloseButton';

type Props = {|
  onDialogConfirm: () => void,
    onDialogRefuse: () => void,
|};

export default function SwapDisclaimerDialog({ onDialogConfirm, onDialogRefuse }: Props): Node {
  const [isCheckboxMarked, setCheckboxMarked] = useState(false);
  const strings = useStrings();

  const actions = [{
    onClick: onDialogConfirm,
    disabled: !isCheckboxMarked,
    primary: true,
    label: strings.disclaimerProceed
  }]


  return (
    <Dialog
      title={strings.disclaimerTitle}
      onClose={onDialogRefuse}
      closeButton={<DialogCloseButton onClose={onDialogRefuse} />}
      styleContentOverride={{ paddingTop: '0px' }}
      styleOverride={{ maxWidth: '648px' }}
      dialogActions={actions}
    >
      <Box display="flex" maxWidth="648px" flexDirection="column" gap="24px">
        <Box>
          <Typography component="div" variant="body1" color="grayscale.900" align="justify">
            {strings.disclaimerDescription}
          </Typography>
        </Box>
        <Box>
          <Typography component="div" fontWeight={500} variant="body1" color="grayscale.900" align="justify">
            {strings.pleaseNote}
          </Typography>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              flexFlow: 'column'
            }}
          >
            {[strings.note1, strings.note2, strings.note3, strings.note4].map((message, i) => (
              <Box sx={{
                display: 'flex',
                flexFlow: 'row nowrap',
                alignItems: 'flex-start',
                justifyContent: 'flex-start'
              }}>
                <Typography component="div" variant="body1" color="grayscale.900">
                  {i + 1}.&nbsp;
                </Typography>
                <Typography component="div" variant="body1" color="grayscale.900">
                  {message}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>

        <FormControlLabel
          label={
            <Typography component="div" variant="body1" color="grayscale.900">
              {strings.swapDisclamerCheckbox}
            </Typography>
          }
          control={
            <Checkbox
              onChange={() => setCheckboxMarked(!isCheckboxMarked)}
              checked={isCheckboxMarked}
              sx={{ marginRight: '8px' }}
            />
          }
          sx={{ margin: '0px' }}
        />

      </Box>
    </Dialog>
  );
}
