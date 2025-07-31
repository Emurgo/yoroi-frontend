import { Box, Stack, Typography, styled } from '@mui/material';
import { useSwapRevamp } from '../../module/SwapContextProvider';

export const LimitInput = () => {
  const { swapForm, tokenInfos } = useSwapRevamp();
  const tokenInputInfo = tokenInfos.get(swapForm.tokenOutInput?.tokenId);

  if (swapForm.estimate === undefined || swapForm.orderType === 'market') {
    return null;
  }

  return (
    <Wrapper>
      <Fieldset component="fieldset">
        <Legend component="legend">Buy At</Legend>

        <StyledInput
          // @ts-ignore
          component="input"
          type="text"
          variant="body1"
          color="ds.text_gray_medium"
          placeholder="0"
          value={swapForm.wantedPrice}
          onChange={event => {
            const val = (event.target as HTMLInputElement).value;
            swapForm.action({ type: 'WantedPriceInputChanged', value: val });
          }}
        />

        <EndAdornment>
          <Typography color="ds.text_gray_max">{tokenInputInfo?.ticker || '-'}</Typography>
        </EndAdornment>
      </Fieldset>
    </Wrapper>
  );
};

const Wrapper = styled(Stack)(({ theme }) => ({
  marginTop: theme.spacing(16),
  marginBottom: theme.spacing(16),
}));

const Fieldset = styled(Box)(({ theme }: any) => ({
  border: '1px solid',
  borderColor: theme.palette.ds.gray_400,
  borderRadius: 8,
  padding: 16,
  display: 'grid',
  gridTemplateColumns: '1fr auto',
  justifyContent: 'start',
  position: 'relative',
  backgroundColor: theme.palette.ds.bg_color_max,
  columnGap: '6px',
  rowGap: '8px',
  height: 56,
}));

const Legend = styled(Box)(({ theme }: any) => ({
  position: 'absolute',
  top: -9,
  left: 16,
  paddingLeft: 4,
  paddingRight: 4,
  backgroundColor: theme.palette.ds?.bg_color_max,
  borderRadius: 10,
  color: theme.palette.ds?.text_gray_medium,
}));

const StyledInput = styled(Typography)(({ theme }: any) => ({
  appearance: 'none',
  border: 0,
  outline: 0,
  backgroundColor: theme.palette.ds?.bg_color_max,
  '::placeholder': {
    color: theme.palette.ds?.gray_600,
  },
}));

const EndAdornment = styled(Box)({
  justifySelf: 'end',
  display: 'flex',
  alignItems: 'center',
  height: '100%',
  width: 'max-content',
});
