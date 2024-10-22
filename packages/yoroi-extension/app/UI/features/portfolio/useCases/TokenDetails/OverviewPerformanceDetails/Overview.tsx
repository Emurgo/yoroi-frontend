import { Box, Link as LinkMui, Stack, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import React from 'react';
import { CopyButton } from '../../../../../components';
import { getNetworkUrl } from '../../../../../utils/getNetworkUrl';
import tokenPng from '../../../common/assets/images/token.png';
import { isPrimaryToken } from '../../../common/helpers/isPrimary';
import { useStrings } from '../../../common/hooks/useStrings';
import { usePortfolio } from '../../../module/PortfolioContextProvider';

interface Props {
  tokenInfo: TokenInfoType;
}

const Overview = ({ tokenInfo }: Props): JSX.Element => {
  const theme: any = useTheme();
  const strings = useStrings();
  const isPrimary = isPrimaryToken(tokenInfo);

  return (
    <Stack direction="column" spacing={theme.spacing(2)}>
      <Stack direction="row" alignItems="center" spacing={theme.spacing(1)}>
        <Box
          width="32px"
          height="32px"
          sx={{
            backgroundColor: theme.palette.ds.bg_color_max,
            borderRadius: `8px`,
          }}
          component="img"
          src={tokenInfo.info.image || tokenPng}
        ></Box>

        <Typography fontWeight="500" color="ds.gray_900">
          {tokenInfo?.info.name}
        </Typography>
      </Stack>

      <TokenOverviewSection label={strings.description} value={tokenInfo.info.metadata.description} />

      {tokenInfo.info.metadata.website && (
        <TokenOverviewSection label={strings.website} value={tokenInfo.info.metadata.website} isExternalLink />
      )}

      {isPrimary ? (
        <></>
      ) : (
        <>
          <TokenOverviewSection label={strings.policyId} value={tokenInfo?.info.policyId} withCopy />

          <TokenOverviewSection label={strings.fingerprint} value={tokenInfo?.info.fingerprint} withCopy />
        </>
      )}

      <TokenOverviewSection
        label={strings.detailsOn}
        value={`${tokenInfo.info.policyId}${tokenInfo?.assetName}`}
        isNetworkUrl={true}
      />
    </Stack>
  );
};

export default Overview;

type TokenOverviewSectionTypes = {
  label: string;
  value: string;
  isExternalLink?: boolean;
  isNetworkUrl?: boolean;
  withCopy?: boolean;
};

const TokenOverviewSection = ({
  label,
  value,
  isExternalLink = false,
  isNetworkUrl = false,
  withCopy,
}: TokenOverviewSectionTypes) => {
  if (!value) {
    return <></>;
  }

  const { networkId } = usePortfolio();
  const networkUrl = networkId !== null ? getNetworkUrl(networkId) : '';
  const theme: any = useTheme();

  return (
    <Stack direction="row" alignItems="flex-end" justifyContent="space-between">
      <Stack direction="column" spacing={theme.spacing(0.5)}>
        <Typography fontWeight="500" color="ds.gray_900">
          {label}
        </Typography>
        {isNetworkUrl ? (
          <Stack direction="row" gap="16px">
            <LinkMui
              target="_blank"
              href={isNetworkUrl != null ? `${networkUrl.cardanoScan}/${value}` : ''}
              rel="noopener noreferrer"
              sx={{ textDecoration: 'none' }}
            >
              Cardanoscan
            </LinkMui>
            <LinkMui
              target="_blank"
              href={isNetworkUrl != null ? `${networkUrl.cexplorer}/${value}` : ''}
              rel="noopener noreferrer"
              sx={{ textDecoration: 'none' }}
            >
              Adaex
            </LinkMui>
          </Stack>
        ) : isExternalLink ? (
          <LinkMui href={value} target="_blank" rel="noopener noreferrer" style={{ width: 'fit-content' }}>
            {value}
          </LinkMui>
        ) : (
          <Typography color="ds.gray_600">{value}</Typography>
        )}
      </Stack>
      {withCopy && <CopyButton textToCopy={value} />}
    </Stack>
  );
};
