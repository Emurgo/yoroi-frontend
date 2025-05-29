import React from 'react';
import { Box, Stack, Typography, styled, useTheme } from '@mui/material';
import { Icons, IconWrapper } from '../../../../components';
import { TokenIcon } from './TokenIcon/TokenIcon';
import { useSwapRevamp } from '../../module/SwapContextProvider';

type AssetInputProps = {
  direction: 'in' | 'out';
  defaultAsset?: any;
  selected?: boolean;
  error?: string | null;
  onAssetSelect: () => void;
};

export const AssetInput: React.FC<AssetInputProps> = ({ direction, defaultAsset, error = null, onAssetSelect }) => {
  const [focusState, setFocusState] = React.useState(false);
  const { atoms }: any = useTheme();
  const { primaryTokenInfo, swapForm } = useSwapRevamp();
  const label = direction === 'in' ? 'From' : 'To';

  console.log('swapForm AssetInput', swapForm);

  const iconImage = direction === 'in' ? swapForm.tokenInInput?.info?.image : '';
  const assetName = direction === 'in' ? swapForm.tokenInInput?.info?.name : 'Select token';
  const tokenQuantity = swapForm.tokenInInput?.formatedAmount;

  return (
    <Wrapper selected={focusState} hasError={!!error} atoms={atoms} direction={direction}>
      <Stack spacing={1} {...atoms.gap_sm}>
        <Label variant="body2">{label}</Label>

        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Stack
            direction="row"
            justifyContent="flex-start"
            alignItems="center"
            onClick={onAssetSelect}
            sx={{ cursor: 'pointer' }}
          >
            <TokenIcon image={iconImage} />
            <Typography variant="h5" fontWeight={500} {...atoms.pl_sm}>
              {assetName ?? primaryTokenInfo.name ?? ''}
            </Typography>
            <IconWrapper icon={Icons.ChevronDown} asButton />
          </Stack>
          <Typography
            sx={{
              appearance: 'none',
              border: '0',
              outline: 'none',
              '::placeholder': { color: 'ds.gray_600' },
              bgcolor: direction === 'in' ? 'ds.bg_color_max' : 'ds.bg_color_contrast_min',
            }}
            component="input"
            type="text"
            variant="h2"
            color="ds.text_gray_medium"
            placeholder="0"
            padding="0"
            textAlign="right"
            // onChange={handleChange}
            // value={disabled ? '' : value}
            onFocus={() => setFocusState(true)}
            onBlur={() => setFocusState(false)}
          />
        </Stack>

        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Stack direction="row" justifyContent="flex-start" alignItems="center" gap={4}>
            <IconWrapper icon={Icons.Wallet} color="ds.el_gray_low" />
            <Typography variant="body2" color="ds.text_gray_low" textAlign="center">
              {tokenQuantity} {swapForm.tokenInInput?.info?.name}
            </Typography>
          </Stack>
          <Typography variant="body2" color="ds.text_gray_low">
            0 USD
          </Typography>
        </Stack>
      </Stack>
    </Wrapper>
  );
};

const Wrapper = styled(Box, {
  shouldForwardProp: prop => prop !== 'selected' && prop !== 'hasError' && prop !== 'atoms' && prop !== 'direction',
})<{
  selected: boolean;
  hasError: boolean;
  atoms: any;
  direction: 'in' | 'out';
}>(({ selected, hasError, atoms, direction, theme }: any) => ({
  ...atoms.py_md,
  ...atoms.px_lg,
  borderRadius: 12,
  border: `2px solid ${
    hasError ? theme.palette.ds.text_error : selected ? theme.palette.ds.el_gray_max : theme.palette.ds.gray_200
  }`,
  backgroundColor: direction === 'in' ? 'transparent' : theme.palette.ds.bg_color_contrast_min,
  height: '132px',

  '&:hover': {
    borderColor: !hasError && theme.palette.ds.el_gray_max,
    borderWidth: 2,
  },
}));

const Label = styled(Typography)(({ theme }: any) => ({
  fontWeight: 500,
  color: theme.palette.ds.text_gray_medium,
}));
