// @flow
import { Box, Button } from '@mui/material';
import { ReactComponent as SwitchIcon } from '../../../../assets/images/revamp/icons/switch.inline.svg';
import { useSwapForm } from '../../context/swap-form';
import SwapStore from '../../../../stores/ada/SwapStore';

type Props = {|
  swapStore: SwapStore,
|};

export const MiddleActions = ({ swapStore }: Props): React$Node => {
  const { clearSwapForm, switchTokens } = useSwapForm();

  return (
    <Box display="flex" alignItems="center" justifyContent="space-between">
      <Box
        sx={{ cursor: 'pointer', color: 'primary.500' }}
        onClick={() => {
          swapStore.resetLimitOrderDisplayValue();
          return switchTokens();
        }}
      >
        <SwitchIcon />
      </Box>
      <Box>
        <Button onClick={() => clearSwapForm()} variant="tertiary" color="primary">
          Clear
        </Button>
      </Box>
    </Box>
  );
};
