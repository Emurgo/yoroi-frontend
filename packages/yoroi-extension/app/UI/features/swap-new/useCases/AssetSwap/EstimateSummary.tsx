import { Link, Skeleton, Stack, Typography, useTheme } from '@mui/material';
import { DisplayInfoInRow } from '../../common/components/DisplayInfoInRow';
import { useStrings } from '../../common/hooks/useStrings';
import { useSwapRevamp } from '../../module/SwapContextProvider';
import { undefinedToken } from '../../common/constants';
import { useModal } from '../../../../components/modals/ModalContext';
import { DexRouteTable } from '../../common/components/Modals/DexRouteTable';
import { LimitDexRouteTable } from '../../common/components/Modals/LimitDexRouteTable';
import { ProtocolAvatar } from '../../common/components/ProtocolAvatar/ProtocolAvatar';
import PriceImpact from '../../common/components/PriceImpact';
import { getPriceImpactRisk } from '../../common/helpers';

type EstimateSummaryProps = {
  showPriceImpact?: boolean;
  showToolTips?: boolean;
};

export const EstimateSummary = ({ showPriceImpact, showToolTips }: EstimateSummaryProps) => {
  const strings = useStrings();
  const { atoms }: any = useTheme();
  const { swapForm, tokenInfos, primaryTokenInfo, isEstimateOrderLoading, isLimitOptionsLoading } = useSwapRevamp();
  const { openModal } = useModal();

  const tokenInInfo = tokenInfos.get(swapForm.tokenInInput.tokenId ?? undefinedToken);
  const tokenOutInfo = tokenInfos.get(swapForm.tokenOutInput.tokenId ?? undefinedToken);
  const tokenInTicker = tokenInInfo?.ticker ?? tokenInInfo?.name ?? '-';
  const tokenOutTicker = tokenOutInfo?.ticker ?? tokenOutInfo?.name ?? '-';
  const isLimitOrder = swapForm.orderType === 'limit';
  const effective = swapForm?.estimate?.priceImpact ?? 0;
  const risk = getPriceImpactRisk(effective);

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
  const pickTokenTicker = (t?: string) => (t && t !== '-' ? t : primaryTokenInfo.ticker);

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
    <Stack direction="column" {...atoms.gap_md} width="503px" {...atoms.mt_lg}>
      <DisplayInfoInRow
        label={strings.routeLabel}
        tooltip={showToolTips ? strings.routePath : undefined}
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
        tooltip={showToolTips ? strings.assetPrice : undefined}
        value={`1 ${pickTokenTicker(tokenInTicker)} = ${swapForm.estimate?.netPrice ?? 0} ${pickTokenTicker(tokenOutTicker)}`}
      />
      <DisplayInfoInRow
        label={strings.feesLabel}
        tooltip={
          showToolTips ? (
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
          ) : undefined
        }
        value={`${swapForm.estimate?.totalFee} ${primaryTokenInfo.ticker}`}
      />
      {showPriceImpact && risk !== 'none' && <DisplayInfoInRow label={strings.priceImpact} value={<PriceImpact />} />}
      <DisplayInfoInRow
        label={strings.minReceived}
        tooltip={showToolTips ? strings.guaranteedMin : undefined}
        value={`${swapForm.estimate?.totalOutput} ${pickTokenTicker(tokenOutTicker)}`}
      />
      {!isLimitOrder && (
        <DisplayInfoInRow
          label={strings.slippageLabel}
          tooltip={showToolTips ? strings.slippageInfo : undefined}
          value={`${swapForm.slippageInput.value} %`}
        />
      )}
    </Stack>
  );
};
