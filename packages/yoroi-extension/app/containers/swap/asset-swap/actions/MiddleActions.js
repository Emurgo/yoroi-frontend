// @flow
import { Box, Button } from '@mui/material';
import { ReactComponent as SwitchIcon } from '../../../../assets/images/revamp/icons/switch.inline.svg';
import { useSwapForm } from '../../context/swap-form';
import { useStrings } from '../../common/useStrings';

export const MiddleActions = (): React$Node => {
  const { clearSwapForm, switchTokens, onChangeLimitPrice, buyTokenInfo = {} } = useSwapForm();
  const { clear } = useStrings();

  const handleSwitchTokens = () => {
    // we have ticker on the buy side, so we can safely switch
    if (buyTokenInfo?.ticker) {
      onChangeLimitPrice('');
      return switchTokens();
    }
  };

  return (
    <Box display="flex" alignItems="center" justifyContent="space-between">
      <Box
        sx={{
          cursor: buyTokenInfo?.ticker ? 'pointer' : 'not-allowed',
          color: buyTokenInfo?.ticker ? 'primary.500' : 'grayscale.400',
        }}
        onClick={handleSwitchTokens}
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
