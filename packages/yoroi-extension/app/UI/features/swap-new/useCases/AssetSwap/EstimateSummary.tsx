import { Link, Skeleton, Stack, Typography, useTheme } from '@mui/material';
import { DisplayInfoInRow } from '../../common/components/DisplayInfoInRow';
import { useStrings } from '../../common/hooks/useStrings';
import { useSwapRevamp } from '../../module/SwapContextProvider';
import { undefinedToken } from '../../common/constants';
import { useModal } from '../../../../components/modals/ModalContext';
import { DexRouteTable } from '../../common/components/Modals/DexRouteTable';
import { LimitDexRouteTable } from '../../common/components/Modals/LimitDexRouteTable';
import { ProtocolAvatar } from '../../common/components/ProtocolAvatar/ProtocolAvatar';

export const EstimateSummary = () => {
  const strings = useStrings();
  const { atoms }: any = useTheme();
  const { swapForm, tokenInfos, primaryTokenInfo, isEstimateOrderLoading, isLimitOptionsLoading } = useSwapRevamp();
  const { openModal } = useModal();

  const tokenInInfo = tokenInfos.get(swapForm.tokenInInput.tokenId ?? undefinedToken);
  const tokenOutInfo = tokenInfos.get(swapForm.tokenOutInput.tokenId ?? undefinedToken);
  const tokenInTicker = tokenInInfo?.ticker ?? tokenInInfo?.name ?? '-';
  const tokenOutTicker = tokenOutInfo?.ticker ?? tokenOutInfo?.name ?? '-';
  const isLimitOrder = swapForm.orderType === 'limit';

  if (isEstimateOrderLoading || isLimitOptionsLoading) {
    return (
      <Stack gap={12}>
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} variant="rectangular" width="100%" height="32px" sx={{ borderRadius: '8px' }} />
        ))}
      </Stack>
    );
  }

  if (swapForm.estimate === undefined) return null;

  const protocol = swapForm.estimate?.splits[0]?.protocol;
  const netPrice = swapForm.estimate.netPrice;
  const roundedPrice = netPrice.toFixed(tokenOutInfo?.decimals ?? 0).replace(/\.0+$/, '');
  const price = roundedPrice !== '0' ? roundedPrice : netPrice.toFixed(6);

  const openRouteModal = () => {
    openModal({
      title: strings.selectRoute,
      content: (
        <Stack direction="column" width="100%">
          {isLimitOrder ? <LimitDexRouteTable /> : <DexRouteTable data={swapForm.estimate?.splits ?? []} />}
        </Stack>
      ),
      height: '327px',
      width: '824px',
    });
  };

  return (
    <Stack direction="column" {...atoms.gap_md} width="100%" {...atoms.mt_lg}>
      <DisplayInfoInRow
        label={strings.routeLabel}
        tooltip={strings.routePath}
        value={
          <Typography sx={{ cursor: 'pointer' }}>
            <Link onClick={openRouteModal}>
              <ProtocolAvatar protocol={protocol} preventOpenLink />
            </Link>
          </Typography>
        }
      />
      <DisplayInfoInRow
        label={strings.priceLabel}
        tooltip="Asset Price"
        value={`1 ${tokenInTicker === '-' ? primaryTokenInfo.ticker : tokenInTicker} = ${price} ${tokenOutTicker}`}
      />
      <DisplayInfoInRow
        label="Fees"
        tooltip={
          <>
            <Typography variant="body2" color="ds.gray_min">
              {strings.feesIncluded}
            </Typography>
            <Typography variant="body2" color="ds.gray_min">
              {strings.dexFee}
            </Typography>
            <Typography variant="body2" color="ds.gray_min">
              {strings.frontendFee}
            </Typography>
          </>
        }
        value={`${swapForm.estimate?.totalFee} ${primaryTokenInfo.ticker}`}
      />
      <DisplayInfoInRow
        label={strings.minReceived}
        tooltip={strings.guaranteedMin}
        value={`${swapForm.estimate?.totalOutput} ${tokenOutTicker}`}
      />
      {!isLimitOrder && (
        <DisplayInfoInRow
          label={strings.slippageLabel}
          tooltip={strings.slippageInfo}
          value={`${swapForm.slippageInput.value} %`}
        />
      )}
    </Stack>
  );
};
