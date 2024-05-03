// @flow
import type { Node } from 'react';
import type { AssetAmount } from './types';
import { Box, Typography } from '@mui/material';
import { ReactComponent as ChevronDownIcon } from '../../assets/images/revamp/icons/chevron-down.inline.svg';
import adaTokenImage from '../../containers/swap/mockAssets/ada.inline.svg';
import defaultTokenImage from '../../assets/images/revamp/token-default.inline.svg';
import { urlResolveForIpfsAndCorsproxy } from '../../coreUtils';
import type { RemoteTokenInfo } from '../../api/ada/lib/state-fetch/types';
import type { State } from '../../containers/swap/context/swap-form/types';

type Props = {|
  label: string,
  tokenInfo: AssetAmount | Object,
  defaultTokenInfo: RemoteTokenInfo,
  onAssetSelect: function,
  handleAmountChange: function,
  showMax?: boolean,
  value?: string,
  touched?: boolean,
  focusState: State<boolean>,
  error: string | null,
|};

export default function SwapInput({
  label,
  showMax = false,
  onAssetSelect,
  error = '',
  handleAmountChange,
  value,
  tokenInfo,
  defaultTokenInfo,
  focusState,
}: Props): Node {
  const { amount: quantity = undefined, image, ticker } = tokenInfo || {};

  const handleChange = e => {
    handleAmountChange(e.target.value);
  };

  const isFocusedColor = focusState.value ? 'ds.gray_cmax' : 'ds.gray_c400';
  const imgSrc =
    ticker === defaultTokenInfo.ticker
      ? adaTokenImage
      : urlResolveForIpfsAndCorsproxy(image) ?? defaultTokenImage;

  return (
    <Box>
      <Box
        onClick={tokenInfo.name?.length > 0 ? undefined : onAssetSelect}
        component="fieldset"
        sx={{
          borderStyle: 'solid',
          borderWidth: tokenInfo.id?.length > 0 || error ? '2px' : '1px',
          borderColor: error ? 'magenta.500' : isFocusedColor,
          borderRadius: '8px',
          p: '16px',
          pr: '8px',
          display: 'grid',
          gridTemplateColumns: '1fr auto',
          gridTemplateRows: '1fr 1fr',
          justifyContent: 'start',
          position: 'relative',
          bgcolor: 'ds.gray_cmin',
          columnGap: '6px',
          rowGap: '8px',
        }}
      >
        <Box
          component="legend"
          sx={{
            top: '-9px',
            left: '16px',
            position: 'absolute',
            px: '4px',
            bgcolor: 'ds.gray_cmin',
            color: error ? 'magenta.500' : 'black',
          }}
        >
          {label}
        </Box>

        <Typography
          sx={{
            appearance: 'none',
            border: '0',
            outline: 'none',
            '::placeholder': { color: 'ds.gray_c600' },
          }}
          component="input"
          type="text"
          variant="body1"
          color="ds.gray_cmax"
          placeholder="0"
          onChange={handleChange}
          value={value}
          onFocus={() => focusState.update(true)}
          onBlur={() => focusState.update(false)}
        />
        <Box sx={{ justifySelf: 'end', cursor: 'pointer' }} onClick={onAssetSelect}>
          <Box height="100%" width="min-content" display="flex" gap="8px" alignItems="center">
            <Box
              width="24px"
              height="24px"
              sx={{ overflowY: 'hidden', '& > svg': { width: '100%', height: '100%' } }}
            >
              <img
                width="100%"
                src={imgSrc}
                alt=""
                onError={e => {
                  e.target.src = defaultTokenImage;
                }}
              />
            </Box>
            <Box width="max-content">{ticker || 'Select asset'}</Box>
            <Box display="inline-flex">
              <ChevronDownIcon />
            </Box>
          </Box>
        </Box>
        {!error && showMax ? (
          <Box>
            <Typography
              component="button"
              variant="caption"
              fontWeight={500}
              sx={{ p: '4px 8px', bgcolor: 'ds.gray_c50', borderRadius: '8px' }}
              onClick={() => {
                handleAmountChange(quantity);
              }}
            >
              MAX
            </Typography>
          </Box>
        ) : (
          <Box minHeight="31px" />
        )}
        <Box sx={{ justifySelf: 'end', alignSelf: 'end' }}>
          <Typography component="div" variant="caption" color="ds.gray_c600">
            Current balance: {quantity || 0} {ticker}
          </Typography>
        </Box>
      </Box>
      {error && (
        <Typography component="div" pt="4px" variant="caption" color="magenta.500">
          {error}
        </Typography>
      )}
    </Box>
  );
}
