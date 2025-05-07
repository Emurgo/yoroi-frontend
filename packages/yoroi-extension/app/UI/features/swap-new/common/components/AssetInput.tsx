import React from 'react';
import { Box, Icon, Stack, Typography, styled, useTheme } from '@mui/material';
import { Icons, IconWrapper } from '../../../../components';

type AssetInputProps = {
  type: 'from' | 'to';
  assetName: string;
  selected?: boolean;
  error?: string | null;
};

export const AssetInput: React.FC<AssetInputProps> = ({ type, assetName, selected = false, error = null }) => {
  const { atoms, space }: any = useTheme();
  const label = type === 'from' ? 'From' : 'To';

  return (
    <Wrapper selected={selected} hasError={!!error} atoms={atoms} type={type}>
      <Stack spacing={1} {...atoms.gap_lg}>
        <Label variant="body2">{label}</Label>

        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Stack direction="row" justifyContent="flex-start" alignItems="center">
            <IconWrapper icon={Icons.Assets} />
            <Typography variant="h5" fontWeight={500} {...atoms.pl_sm}>
              {assetName}
            </Typography>
            <IconWrapper icon={Icons.ChevronDown} asButton />
          </Stack>
          <Typography
            sx={{
              appearance: 'none',
              border: '0',
              outline: 'none',
              '::placeholder': { color: 'grayscale.600' },
              bgcolor: type === 'from' ? 'ds.bg_color_max' : 'ds.bg_color_contrast_min',
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
            // onFocus={() => focusState.update(true)}
            // onBlur={() => focusState.update(false)}
          />
        </Stack>

        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Stack direction="row" justifyContent="flex-start" alignItems="center" gap={4}>
            <IconWrapper icon={Icons.Wallet} />
            <Typography variant="body2" color="ds.text_gray_low">
              2 345 119,005231 ADA
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
  shouldForwardProp: prop => prop !== 'selected' && prop !== 'hasError' && prop !== 'atoms' && prop !== 'type',
})<{
  selected: boolean;
  hasError: boolean;
  atoms: any;
  type: 'from' | 'to';
}>(({ selected, hasError, atoms, type, theme }: any) => ({
  ...atoms.py_md,
  ...atoms.px_lg,
  borderRadius: 12,
  border: `1px solid ${
    hasError ? theme.palette.ds.text_error : selected ? theme.palette.ds_gray_max : theme.palette.ds.gray_200
  }`,
  backgroundColor: type === 'from' ? 'transparent' : theme.palette.ds.bg_color_contrast_min,
}));

const Label = styled(Typography)(({ theme }: any) => ({
  fontWeight: 500,
  color: theme.palette.ds.text_gray_medium,
}));
