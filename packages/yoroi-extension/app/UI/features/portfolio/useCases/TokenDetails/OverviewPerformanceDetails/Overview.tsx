import { Box, Link as LinkMui, Stack, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { CopyButton } from '../../../../../components';
import tokenPng from '../../../common/assets/images/token.png';
import { isPrimaryToken } from '../../../common/helpers/isPrimary';
import { useStrings } from '../../../common/hooks/useStrings';
import { usePortfolio } from '../../../module/PortfolioContextProvider';

interface Props {
  tokenInfo: TokenInfoType;
}

const Overview = ({ tokenInfo }: Props): React.ReactNode => {
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
            borderRadius: '16px',
          }}
          component="img"
          src={tokenInfo.info.image || tokenPng}
          onError={e => {
            // @ts-ignore
            e.target.src = tokenPng;
          }}
        ></Box>

        <Typography fontWeight="500" color="ds.gray_900">
          {tokenInfo?.info.name}
        </Typography>
      </Stack>

      <TokenOverviewSection label={strings.description} value={tokenInfo?.info.metadata?.description} />

      <TokenOverviewSection
        label={strings.website}
        value={isPrimary ? 'https://cardano.org/' : tokenInfo?.info.metadata?.website}
        isExternalLink
      />

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
        value={`${tokenInfo.info.fingerprint}`}
        isNetworkUrl={true}
        isPrimary={isPrimary}
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
  isPrimary?: boolean;
};

const TokenOverviewSection = ({
  label,
  value,
  isExternalLink = false,
  isNetworkUrl = false,
  withCopy,
  isPrimary,
}: TokenOverviewSectionTypes) => {
  // if (!value && !isPrimary) {
  //   return <></>;
  // }

  const { explorer } = usePortfolio();
  const theme: any = useTheme();

  return (
    <Stack direction="row" alignItems="flex-end" gap="8px">
      <Stack direction="column" spacing={theme.spacing(0.5)}>
        <Typography fontWeight="500" color="ds.gray_900">
          {label}
        </Typography>
        {isNetworkUrl ? (
          <Stack direction="row" gap="16px">
            <LinkMui
              target="_blank"
              href={
                isNetworkUrl != null
                  ? isPrimary
                    ? explorer.tokenInfo.baseUrl.replace(/^(https?:\/\/[^\/]+)\/.*/, '$1')
                    : `${explorer.tokenInfo.baseUrl}${value}`
                  : ''
              }
              rel="noopener noreferrer"
              sx={{ textDecoration: 'none' }}
            >
              {explorer.tokenInfo.name}
            </LinkMui>
          </Stack>
        ) : isExternalLink ? (
          <LinkMui href={value} target="_blank" rel="noopener noreferrer" style={{ width: 'fit-content' }}>
            {value || '-'}
          </LinkMui>
        ) : (
          <Typography color="ds.gray_600">{value || '-'}</Typography>
        )}
      </Stack>
      {withCopy && <CopyButton textToCopy={value} />}
    </Stack>
  );
};
