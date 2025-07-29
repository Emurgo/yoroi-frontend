import { Box, Stack, Typography } from '@mui/material';
import { useSwapRevamp } from '../../module/SwapContextProvider';

export const LimitInput = () => {
  const { swapForm, tokenInfos } = useSwapRevamp();
  const tokenInputInfo = tokenInfos.get(swapForm.tokenOutInput?.tokenId);

  if (swapForm.estimate === undefined || swapForm.orderType === 'market') {
    return null;
  }

  return (
    <Stack sx={{ my: 16 }}>
      <Box
        component="fieldset"
        sx={{
          border: '1px solid',
          borderColor: 'grayscale.400',
          borderRadius: '8px',
          p: '16px',
          display: 'grid',
          gridTemplateColumns: '1fr auto',
          justifyContent: 'start',
          position: 'relative',
          bgcolor: 'ds.bg_color_max',
          columnGap: '6px',
          rowGap: '8px',
        }}
        height="56px"
      >
        <Box
          component="legend"
          sx={{
            top: '-9px',
            left: '16px',
            position: 'absolute',
            px: '4px',
            bgcolor: 'ds.bg_color_max',
            borderRadius: '10px',
            color: 'ds.text_gray_medium',
          }}
        >
          Buy At
        </Box>

        <Typography
          sx={{
            appearance: 'none',
            border: '0',
            outline: 'none',
            '::placeholder': { color: 'ds.gray_600' },
          }}
          component="input"
          type="text"
          variant="body1"
          color="ds.text_gray_medium"
          placeholder="0"
          bgcolor={'ds.bg_color_max'}
          value={swapForm.wantedPrice}
          onChange={event => {
            const val = (event.target as HTMLInputElement).value;
            swapForm.action({ type: 'WantedPriceInputChanged', value: val });
          }}
        />
        <Box sx={{ justifySelf: 'end' }}>
          <Box height="100%" width="max-content" display="flex" alignItems="center">
            <Typography color="ds.text_gray_max">{tokenInputInfo?.ticker || '-'}</Typography>
          </Box>
        </Box>
      </Box>
    </Stack>
  );
};
