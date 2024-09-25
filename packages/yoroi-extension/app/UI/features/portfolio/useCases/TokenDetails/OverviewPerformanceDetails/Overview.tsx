import { Box, Link as LinkMui, Stack, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import React from 'react';
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
  const { networkId } = usePortfolio();
  const networkUrl = networkId !== null ? getNetworkUrl(networkId) : '';
  console.log('networkUrl', networkUrl);
  // const explorers = useExplorers('mainnet' as Chain.SupportedNetworks);

  // console.log('explorers', explorers);

  const isPrimary = isPrimaryToken(tokenInfo.info);
  console.log('URLL', `${networkUrl}/${tokenInfo?.info.policyId}${tokenInfo?.assetName}`);
  return (
    <Stack direction="column" spacing={theme.spacing(2)}>
      <Stack direction="row" alignItems="center" spacing={theme.spacing(1)}>
        <Box
          width="32px"
          height="32px"
          sx={{
            backgroundColor: theme.palette.ds.gray_300,
            borderRadius: `50px`,
          }}
          component="img"
          src={tokenInfo.tokenLogo || tokenPng}
        ></Box>

        <Typography fontWeight="500" color="ds.gray_900">
          {tokenInfo?.name}
        </Typography>
      </Stack>

      <TokenOverviewSection label={strings.description} value={tokenInfo.info.metadata.description} />

      <TokenOverviewSection
        label={strings.website}
        value={tokenInfo.info.metadata.website || 'https://cardano.org/'}
        isExternalLink
      />

      {isPrimary ? (
        <></>
      ) : (
        <>
          <TokenOverviewSection label={strings.policyId} value={tokenInfo?.info.policyId} />

          <TokenOverviewSection label={strings.fingerprint} value={tokenInfo?.info.fingerprint} />
        </>
      )}

      <TokenOverviewSection
        label={strings.fingerprint}
        value={`${networkUrl}/${tokenInfo.info.policyId}${tokenInfo?.assetName}`}
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
};

const TokenOverviewSection = ({ label, value, isExternalLink = false, isNetworkUrl = false }: TokenOverviewSectionTypes) => {
  console.log('value', value);
  const theme: any = useTheme();
  if (!value) {
    return <></>;
  }

  return (
    <Stack direction="column" spacing={theme.spacing(0.5)}>
      <Typography fontWeight="500" color="ds.gray_900">
        {label}
      </Typography>
      {isNetworkUrl ? (
        <Stack direction="row" gap="16px">
          <LinkMui
            target="_blank"
            href={isNetworkUrl != null ? `${value}` : ''}
            rel="noopener noreferrer"
            sx={{ textDecoration: 'none' }}
          >
            Cardanoscan
          </LinkMui>
          <LinkMui
            target="_blank"
            href={isNetworkUrl != null ? `${value}` : ''}
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
  );
};
