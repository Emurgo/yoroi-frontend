import { Stack, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { isEmpty } from 'lodash';
import { Chip, ChipTypes, Icon, Skeleton } from '../../../../../components';
import { useCurrencyPairing } from '../../../../../context/CurrencyContext';
import { DEFAULT_FIAT_PAIR } from '../../../common/helpers/constants';
import { formatNumber } from '../../../common/helpers/formatHelper';
import { formatPriceChange, priceChange } from '../../../common/helpers/priceChange';
import { useStrings } from '../../../common/hooks/useStrings';
import { usePortfolio } from '../../../module/PortfolioContextProvider';
import { usePortfolioTokenActivity } from '../../../module/PortfolioTokenActivityProvider';

interface Props {
  chartData: any;
  detailInfo: any;
  isLoading: boolean;
  tokenInfo: TokenInfoType;
  isDragging?: boolean;
}

export const TokenMarketPriceOverview = ({ chartData, detailInfo, tokenInfo, isDragging }: Props): React.ReactNode => {
  const isPrimaryToken: boolean = tokenInfo?.id === '-';
  const theme: any = useTheme();
  const strings = useStrings();
  const { unitOfAccount } = usePortfolio();
  // Fetch data based on the selected interval

  const ptActivity = useCurrencyPairing().ptActivity;
  const { changeValue, changePercent } = priceChange(ptActivity.open, ptActivity?.close);

  const {
    tokenActivity: { data24h },
  } = usePortfolioTokenActivity();

  const deltaPriceChange = !isPrimaryToken && !isEmpty(data24h) && data24h[tokenInfo?.info?.id][1].price?.change;

  const priceChangeProcent = isPrimaryToken ? detailInfo?.changePercent || changePercent : !isEmpty(data24h) && deltaPriceChange;
  const priceChangeValue = isPrimaryToken
    ? detailInfo?.changeValue || changeValue
    : !isEmpty(data24h) && data24h[tokenInfo?.info?.id][1].price?.close - data24h[tokenInfo?.info?.id][1].price?.open;
  return (
    <Stack
      direction="row"
      justifyContent="flex-start"
      alignItems="center"
      gap="16px"
      sx={{ p: !isPrimaryToken && theme.spacing(3) }}
    >
      <Typography fontWeight="500" color="ds.text_gray_medium">
        {strings.marketPrice}
      </Typography>

      <Stack direction="row" alignItems="center" spacing={theme.spacing(2)}>
        <Stack direction="row" alignItems="center" gap="16px">
          <TokenPrice
            ptActivity={ptActivity}
            isPrimaryToken={isPrimaryToken}
            unitOfAccount={unitOfAccount}
            secondaryTokenActivity={data24h && data24h[tokenInfo?.info?.id]}
            detailInfo={detailInfo}
            isDragging={isDragging}
          />

          {chartData === undefined ? (
            <Skeleton width="64px" height="13px" />
          ) : (
            <Stack direction="row" gap="4px">
              <PriceChangeChip value={Number(priceChangeProcent)} />
              <PriceValueChip value={Number(priceChangeValue)} unitOfAccount={unitOfAccount || DEFAULT_FIAT_PAIR} />
            </Stack>
          )}
        </Stack>
      </Stack>
    </Stack>
  );
};

const TokenPrice = ({ isPrimaryToken, unitOfAccount, secondaryTokenActivity, ptActivity, detailInfo, isDragging }) => {
  const tokenPrice = isPrimaryToken ? ptActivity.close : secondaryTokenActivity && secondaryTokenActivity[1].price?.close;

  const sPrice = secondaryTokenActivity && secondaryTokenActivity[1].price?.close;

  const ptPrice = isDragging ? detailInfo.value : ptActivity.close;

  const ptUnitPrice = sPrice * ptPrice;

  if (!isPrimaryToken && isNaN(ptUnitPrice)) {
    return <Typography variant="caption">-</Typography>;
  }

  if (tokenPrice == null) return <Skeleton variant="text" width="50px" height="30px" />;

  return (
    <Stack direction="row" alignItems="flex-start" textAlign="center" color="ds.text_gray_medium">
      <Typography fontWeight="500">{formatPriceChange(isPrimaryToken ? ptPrice : ptUnitPrice, 4)}</Typography>
      <Typography variant="caption" mt="2px">
        &nbsp;{unitOfAccount}
      </Typography>
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
