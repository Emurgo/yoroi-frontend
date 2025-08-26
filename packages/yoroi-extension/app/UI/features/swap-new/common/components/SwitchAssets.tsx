import { IconButton, Stack, styled } from '@mui/material';
import { Icons, IconWrapper } from '../../../../components';
import { useSwapRevamp } from '../../module/SwapContextProvider';

export const SwitchAssets = () => {
  const { swapForm } = useSwapRevamp();
  return (
    <Stack direction="row" justifyContent="center" alignItems="center" width="100%">
      <Wrapper>
        <IconWrapper icon={Icons.Swap} color="ds.el_primary_medium" onClick={() => swapForm.action({ type: 'SwitchTouched' })} />
      </Wrapper>
    </Stack>
  );
};
const Wrapper = styled(IconButton)(({ theme }: any) => ({
  border: '2px solid',
  borderColor: theme.palette.ds.bg_color_max,
  borderRadius: '50px',
  width: '40px',
  height: '40px',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: theme.palette.ds.bg_color_contrast_min,
  marginTop: '-20px',
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: theme.palette.ds.bg_color_contrast_min,
  },
}));
