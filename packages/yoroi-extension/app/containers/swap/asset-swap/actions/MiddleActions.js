// @flow
import { Box, Button } from '@mui/material';
import { ReactComponent as SwitchIcon } from '../../../../assets/images/revamp/icons/switch.inline.svg';
import { useSwapForm } from '../../context/swap-form';
import { useStrings } from '../../common/useStrings';

export const MiddleActions = (): React$Node => {
  const { clearSwapForm, switchTokens, onChangeLimitPrice } = useSwapForm();
  const { clear } = useStrings();

  return (
    <Box display="flex" alignItems="center" justifyContent="space-between">
      <Box
        sx={{ cursor: 'pointer', color: 'primary.500' }}
        onClick={() => {
          onChangeLimitPrice('');
          return switchTokens();
        }}
      >
        <SwitchIcon />
      </Box>
      <Box>
        <Button onClick={() => clearSwapForm()} variant="tertiary" color="primary">
          {clear}
        </Button>
      </Box>
    </Box>
  );
};
