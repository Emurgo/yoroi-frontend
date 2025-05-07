import { Box, Stack, Typography, styled, useTheme } from '@mui/material';
import React from 'react';
import { Chip, ChipTypes, Icon } from '../../../../components';
import WalletAccountIcon from '../../../../components/WalletAccountIcon/WalletAccountIcon';
import { useCurrencyPairing } from '../../../../context/CurrencyContext';
import { DEFAULT_FIAT_PAIR } from '../../../portfolio/common/helpers/constants';
import { formatNumber } from '../../../portfolio/common/helpers/formatHelper';
import { priceChange } from '../../../portfolio/common/helpers/priceChange';
import { AssetCarousel } from '../../common/AssetCarousel/AssetCarousel';
import { formatValue } from '../../common/utils';
import { useTxReviewModal } from '../../module/ReviewTxProvider';
import { useStrings } from '../../common/hooks/useStrings';

export const WalletInfoSection = () => {
  const { currentWalletDetails } = useTxReviewModal();
  const { selected, selectedWalletName } = currentWalletDetails;

  const { plate } = selected;
  return (
    <Stack p="24px">
      <Stack alignItems="center" justifyContent="">
        <Box
          sx={{
            borderRadius: '8px',
            '& canvas': {
              borderRadius: '4px',
            },
          }}
        >
          <WalletAccountIcon iconSeed={plate.ImagePart} size={8} scalePx={15} />
        </Box>
        <Typography variant="h5" mt="8px" fontWeight={500}>
          {selectedWalletName}
        </Typography>
        <Typography variant="body1" color="ds.text_gray_low">
          {plate.TextPart}
        </Typography>
      </Stack>
      <WalletStats />

      <WalletAssets />
    </Stack>
  );
};

const StyledStack = styled(Stack)(({ theme }: any) => ({
  background: theme.palette.ds.bg_gradient_3,
  borderRadius: '9px',
}));

const WalletStats = () => {
  const { primaryBalance, primaryTokenInfo } = useTxReviewModal();
  const strings = useStrings();
  const {
    ptActivity: { close: ptPrice, open },
    currency,
  } = useCurrencyPairing();
  const totalAmount = formatValue(primaryTokenInfo.quantity.multipliedBy(String(ptPrice)));
  const { changeValue, changePercent } = priceChange(open, ptPrice);

  return (
    <StyledStack p="16px" my="16px" direction="column">
      <Stack direction="row" justifyContent="space-between" mb="19px">
        <Typography variant="caption" color="ds.white_static">
          {strings.tolatValue}
        </Typography>
        <Typography variant="body2" color="ds.white_static">
          1 {primaryTokenInfo.name} = {ptPrice.toFixed(4)} {currency}
        </Typography>
      </Stack>
      <Stack direction="row" alignItems="flex-end" gap="8px">
        <Typography variant="h2" fontWeight={500} color="ds.white_static">
          {primaryBalance}
        </Typography>
        <Typography variant="body1" fontWeight={500} color="ds.white_static">
          {primaryTokenInfo.name}
        </Typography>
      </Stack>
      <Stack direction="row" justifyContent="space-between" mt="2px">
        <Typography color="ds.white_static">
          {totalAmount} {currency || DEFAULT_FIAT_PAIR}
        </Typography>
        <Stack direction="row" gap="4px">
          <PriceChangeChip value={Number(changePercent)} />
          <PriceValueChip value={Number(changeValue)} unitOfAccount={currency || DEFAULT_FIAT_PAIR} />
        </Stack>
      </Stack>
    </StyledStack>
  );
};

const WalletAssets = () => {
  const { ftAssetsList, nftAssetList } = useTxReviewModal();

  const formatedNftAssetList = [nftAssetList[0], nftAssetList[1]].map(nft => ({
    ...nft,
    info: { image: nft.image },
  }));
  return (
    <Stack direction="row" gap="16px">
      <WalletAssetsSection data={ftAssetsList} label="Tokens" />
      <WalletAssetsSection data={formatedNftAssetList} label="NFTs" />
    </Stack>
  );
};

const WalletAssetsSection = ({ data, label }) => {
  return (
    <Stack
      direction="column"
      height="160px"
      width="233px"
      sx={{ border: '1px solid', borderColor: 'ds.gray_200', borderRadius: '8px', position: 'relative' }}
      p="16px"
      gap="16px"
    >
      <Typography variant="body1" color="ds.text_gray_medium" fontWeight={500}>
        {label}
      </Typography>
      <Stack direction="column" justifyContent="space-between" gap="8px">
        <Typography variant="h3" fontSize="28px" fontWeight={500}>
          {data.length > 0 ? data.length : '-'}
        </Typography>
        <AssetCarousel data={data} />
      </Stack>
    </Stack>
  );
};

const PriceChangeChip = ({ value }: { value: number }) => {
  const theme: any = useTheme();
  const valueToDisplay = value >= 0 ? formatNumber(value) : formatNumber(-1 * value);

  return (
    <>
      <Chip
        type={value > 0 ? ChipTypes.ACTIVE : value < 0 ? ChipTypes.INACTIVE : ChipTypes.DISABLED}
        label={
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            {value > 0 ? (
              <Icon.ChipArrowUp fill={theme.palette.ds.secondary_800} />
            ) : value < 0 ? (
              <Icon.ChipArrowDown fill={theme.palette.ds.sys_magenta_700} />
            ) : null}
            {/* @ts-ignore */}
            <Typography variant="caption1">{valueToDisplay === 'NaN' ? '-' : valueToDisplay}%</Typography>
          </Stack>
        }
      />
    </>
  );
};

const PriceValueChip = ({ value, unitOfAccount }: { value: number; unitOfAccount: string }) => {
  return (
    <>
      <Chip
        type={value > 0 ? ChipTypes.ACTIVE : value < 0 ? ChipTypes.INACTIVE : ChipTypes.DISABLED}
        label={
          <Typography variant="caption">
            {value > 0 && '+'}
            {formatNumber(value) === 'NaN' ? '-' : formatNumber(value)} {unitOfAccount}
          </Typography>
        }
      />
    </>
  );
};
