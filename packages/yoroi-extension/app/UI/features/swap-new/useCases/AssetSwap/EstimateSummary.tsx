import { Link, Stack, Typography, useTheme } from '@mui/material';
import { DisplayInfoInRow } from '../../common/components/DisplayInfoInRow';
import { useStrings } from '../../common/hooks/useStrings';
import { useSwapRevamp } from '../../module/SwapContextProvider';
import { undefinedToken } from '../../common/constants';
import { useModal } from '../../../../components/modals/ModalContext';
import { DexRouteTable } from '../../common/components/Modals/DexRouteTable';

export const EstimateSummary = () => {
  const strings = useStrings();
  const { atoms }: any = useTheme();
  const { swapForm, tokenInfos, primaryTokenInfo } = useSwapRevamp();
  const { openModal } = useModal();

  const tokenInInfo = tokenInfos.get(swapForm.tokenInInput.tokenId ?? undefinedToken);
  const tokenOutInfo = tokenInfos.get(swapForm.tokenOutInput.tokenId ?? undefinedToken);

  const tokenInTicker = tokenInInfo?.ticker ?? tokenInInfo?.name ?? '-';
  const tokenOutTicker = tokenOutInfo?.ticker ?? tokenOutInfo?.name ?? '-';

  if (swapForm.estimate === undefined) return null;

  const protocol = swapForm.estimate?.splits[0]?.protocol;

  const netPrice = swapForm.estimate.netPrice;
  const roundedPrice = netPrice.toFixed(tokenOutInfo?.decimals ?? 0).replace(/\.0+$/, '');
  const price = roundedPrice !== '0' ? roundedPrice : netPrice.toFixed(6);

  const openRouteModal = () => {
    openModal({
      title: 'Select Route',
      content: (
        <Stack direction="column" width="100%">
          <DexRouteTable data={swapForm.estimate?.splits ?? []} />
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
          <Typography>
            <Link onClick={openRouteModal}>{protocol}</Link>
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
      <DisplayInfoInRow
        label={strings.slippageLabel}
        tooltip={strings.slippageInfo}
        value={`${swapForm.slippageInput.value} %`}
      />
    </Stack>
  );
};
