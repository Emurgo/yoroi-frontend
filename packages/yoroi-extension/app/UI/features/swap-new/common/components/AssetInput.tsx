import React from 'react';
import { Box, Stack, Typography, styled, useTheme } from '@mui/material';
import { Icons, IconWrapper } from '../../../../components';
import { useSwapRevamp } from '../../module/SwapContextProvider';
import { TokenInfoIcon } from '../../../portfolio/common/components/TokenInfoIcon';
import { usePortfolioTokenActivity } from '../../../portfolio/module/PortfolioTokenActivityProvider';
import { useCurrencyPairing } from '../../../../context/CurrencyContext';
import { bigNumberToBigInt } from '../../../portfolio/useCases/TokensTable/TableColumnsChip';
import { atomicBreakdown } from '@yoroi/common';
import BigNumber from 'bignumber.js';

type AssetInputProps = {
  direction: 'in' | 'out';
  selected?: boolean;
  onAssetSelect: () => void;
};

export const AssetInput: React.FC<AssetInputProps> = ({ direction, onAssetSelect }) => {
  const [focusState, setFocusState] = React.useState(false);
  const { atoms }: any = useTheme();
  const { primaryTokenInfo, swapForm, tokenInfos, ftAssetList } = useSwapRevamp();

  const tokenInput = swapForm[direction === 'in' ? 'tokenInInput' : 'tokenOutInput'];
  // const inputRef = direction === 'in' ? swapForm.tokenInInputRef : swapForm.tokenOutInputRef;
  const error = direction === 'in' ? tokenInput.error : null;

  const label = direction === 'in' ? 'From' : 'To';
  const tokenInputInfo = tokenInfos.get(tokenInput.tokenId);
  const touched = tokenInput.isTouched;

  const {
    tokenActivity: { data24h },
  } = usePortfolioTokenActivity();

  const {
    ptActivity: { close: primaryTokenActivity },
    currency,
  } = useCurrencyPairing();

  let totalPrice: string | undefined;
  let selectedToken: any;
  const tokenPrice = data24h?.[1]?.price?.close ?? 1;

  if (direction === 'in' && primaryTokenActivity != null) {
    const normalizeId = (id?: string | null) => (id === '' ? '.' : id);
    selectedToken = ftAssetList.filter(token => {
      return normalizeId(token.info.id) === swapForm.tokenInInput?.tokenId;
    })[0];
    const selectedTokenDecimals = selectedToken?.info?.numberOfDecimals ?? 0;

    try {
      const quantityBigInt = bigNumberToBigInt(selectedToken.quantity);
      const activityBN = new BigNumber(primaryTokenActivity.toString());

      totalPrice = atomicBreakdown(quantityBigInt, selectedTokenDecimals)
        .bn.times(tokenPrice)
        .times(activityBN)
        .toFormat(selectedTokenDecimals);
    } catch (err) {
      console.error('Failed to calculate totalPrice:', err);
    }
  }

  const assetInputName = React.useMemo(() => {
    if (direction === 'in') {
      return tokenInputInfo?.ticker ? tokenInputInfo?.name : primaryTokenInfo.name;
    }
    if (direction === 'out') {
      if (!touched) {
        return 'Select token';
      }
      return tokenInputInfo?.ticker ?? tokenInputInfo?.name;
    }
    return undefined;
  }, [direction, tokenInputInfo]);

  // const focusInput = () => {
  //   if (inputRef?.current) {
  //     inputRef.current.focus();
  //   }
  // };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    console.log('[handleInputChange]', value);
  };

  return (
    <Wrapper selected={focusState} hasError={!!error} atoms={atoms} direction={direction}>
      <Stack spacing={1} {...atoms.gap_sm}>
        <Label variant="body2">{label}</Label>

        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Stack
            direction="row"
            justifyContent="flex-start"
            alignItems="center"
            onClick={() => {
              onAssetSelect();
            }}
            sx={{ cursor: 'pointer' }}
          >
            <TokenInfoIcon
              info={{ id: tokenInputInfo?.id, policy: tokenInputInfo?.fingerprint, name: tokenInputInfo?.name }}
              size="md"
            />
            <Typography variant="h5" fontWeight={500} {...atoms.pl_sm} inline>
              {assetInputName}
            </Typography>
            <IconWrapper icon={Icons.ChevronDown} asButton />
          </Stack>
          <Typography
            sx={{
              width: '50%',
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
            onChange={handleInputChange}
            // value={disabled ? '' : value}
            onFocus={() => setFocusState(true)}
            onBlur={() => setFocusState(false)}
          />
        </Stack>

        {direction === 'in' ? (
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Stack direction="row" justifyContent="flex-start" alignItems="center" gap={4}>
              <IconWrapper icon={Icons.Wallet} color="ds.el_gray_low" />
              <Typography variant="body2" color="ds.text_gray_low" textAlign="center">
                {selectedToken?.formatedAmount} {selectedToken?.info.name}
              </Typography>
            </Stack>
            <Typography variant="body2" color="ds.text_gray_low">
              {totalPrice} {currency}
            </Typography>
          </Stack>
        ) : (
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Stack direction="row" justifyContent="flex-start" alignItems="center" gap={4}>
              <IconWrapper icon={Icons.Wallet} color="ds.el_gray_low" />
              <Typography variant="body2" color="ds.text_gray_low" textAlign="center">
                0
              </Typography>
            </Stack>
          </Stack>
        )}
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