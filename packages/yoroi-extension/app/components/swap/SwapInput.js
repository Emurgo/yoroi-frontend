// @flow
import { Box, Typography, useTheme } from '@mui/material';
import type { Node } from 'react';
import { useEffect, useState } from 'react';
import adaTokenImage from '../../assets/images/ada.inline.svg';
import { ReactComponent as ChevronDownIcon } from '../../assets/images/revamp/icons/chevron-down.inline.svg';
import defaultTokenImage from '../../assets/images/revamp/token-default.inline.svg';
import defaultTokenDarkImage from '../../assets/images/revamp/asset-default-dark.inline.svg';
import type { AssetAmount } from './types';
import type { RemoteTokenInfo } from '../../api/ada/lib/state-fetch/types';
import type { State } from '../../containers/swap/context/swap-form/types';

type Props = {|
  label: string,
  tokenInfo: AssetAmount | Object,
  defaultTokenInfo: RemoteTokenInfo,
  getTokenInfo: string => Promise<RemoteTokenInfo>,
  onAssetSelect: function,
  handleAmountChange: function,
  showMax?: boolean,
  value?: string,
  disabled?: boolean,
  focusState: State<boolean>,
  error: string | null,
|};

export default function SwapInput({
  label,
  showMax = false,
  disabled = false,
  onAssetSelect,
  error = '',
  handleAmountChange,
  value,
  tokenInfo,
  defaultTokenInfo,
  getTokenInfo,
  focusState,
}: Props): Node {
  const [remoteTokenLogo, setRemoteTokenLogo] = useState<?string>(null);
  const { id, amount: quantity = undefined, ticker } = tokenInfo || {};
  const { name } = useTheme();
  console.log('name', name);

  const handleChange = e => {
    if (!disabled) {
      handleAmountChange(e.target.value);
    }
  };

  const isFocusedColor = focusState.value ? 'grayscale.max' : 'grayscale.400';

  useEffect(() => {
    if (id != null) {
      getTokenInfo(id)
        .then(remoteTokenInfo => {
          if (remoteTokenInfo.logo != null) {
            setRemoteTokenLogo(`data:image/png;base64,${remoteTokenInfo.logo}`);
          }
          return null;
        })
        .catch(e => {
          console.warn('Failed to resolve remote info for token: ' + id, e);
        });
    }
  }, [id]);

  const defaultImage = name === 'dark-theme' ? defaultTokenDarkImage : defaultTokenImage;
  const imgSrc = ticker === defaultTokenInfo.ticker ? adaTokenImage : remoteTokenLogo ?? defaultImage;

  return (
    <Box>
      <Box
        onClick={tokenInfo.name?.length > 0 ? undefined : onAssetSelect}
        component="fieldset"
        sx={{
          borderStyle: 'solid',
          borderWidth: (tokenInfo.id?.length > 0 && error) || focusState.value ? '2px' : '1px',
          borderColor: error ? 'ds.sys_magenta_500' : isFocusedColor,
          borderRadius: '8px',
          p: '16px',
          display: 'grid',
          gridTemplateColumns: '1fr auto',
          gridTemplateRows: '1fr 1fr',
          justifyContent: 'start',
          position: 'relative',
          bgcolor: 'ds.bg_color_max',
          columnGap: '6px',
          rowGap: '8px',
          maxHeight: '95px',
          '&:hover': {
            borderColor: !error && 'grayscale.max',
          },
        }}
      >
        <Box
          component="legend"
          sx={{
            top: '-9px',
            left: '16px',
            position: 'absolute',
            px: '4px',
            bgcolor: 'ds.bg_color_max',
            color: error ? 'magenta.500' : 'ds.text_gray_medium',
          }}
        >
          {label}
        </Box>

        <Typography
          sx={{
            appearance: 'none',
            border: '0',
            outline: 'none',
            '::placeholder': { color: 'grayscale.600' },
            bgcolor: 'ds.bg_color_max',
          }}
          component="input"
          type="text"
          variant="body1"
          color="grayscale.max"
          placeholder="0"
          onChange={handleChange}
          value={disabled ? '' : value}
          onFocus={() => focusState.update(true)}
          onBlur={() => focusState.update(false)}
        />
        <Box sx={{ justifySelf: 'end', cursor: 'pointer' }} onClick={onAssetSelect}>
          <Box height="100%" width="min-content" display="flex" gap="8px" alignItems="center">
            <Box
              width="24px"
              height="24px"
              sx={{
                overflowY: 'hidden',
                '& > svg': { width: '100%', height: '100%' },
                borderRadius: '4px',
              }}
            >
              <img
                width="100%"
                src={imgSrc}
                alt=""
                onError={e => {
                  e.target.src = defaultImage;
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
              sx={{
                p: '4px 8px',
                bgcolor: 'grayscale.50',
                borderRadius: '8px',
                ':disabled': {
                  cursor: 'not-allowed',
                },
                color: 'ds.text_gray_medium',
              }}
              onClick={() => {
                handleAmountChange(quantity);
              }}
              disabled={disabled}
            >
              MAX
            </Typography>
          </Box>
        ) : (
          <Box minHeight="31px" />
        )}
        <Box sx={{ justifySelf: 'end', alignSelf: 'end' }}>
          <Typography component="div" variant="caption" color="grayscale.600">
            Current balance: {quantity || 0} {ticker}
          </Typography>
        </Box>
      </Box>
      {error && (
        <Typography component="div" pt="4px" variant="caption" color="ds.sys_magenta_500">
          {error}
        </Typography>
      )}
    </Box>
  );
}
