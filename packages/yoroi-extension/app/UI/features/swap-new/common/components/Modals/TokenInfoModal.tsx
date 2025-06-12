import { Stack, Typography, Link as LinkMui } from '@mui/material';
import { TokenInfoIcon } from '../../../../portfolio/common/components/TokenInfoIcon';
import { DisplayInfoInRow } from '../DisplayInfoInRow';
import { isPrimaryToken } from '@yoroi/portfolio';
import { truncateAddressShort } from '../../../../../../utils/formatters';
import { useSwapRevamp } from '../../../module/SwapContextProvider';

const TokenInfoModal = ({ token }) => {
  console.log('token', token);
  const isPrimary = isPrimaryToken(token.id);
  const { explorer } = useSwapRevamp();
  return (
    <Stack direction="column" gap={16} justifyContent="center" alignItems="center">
      <TokenInfoIcon info={{ id: token.id }} />
      <Typography variant="h5" color="ds.text_gray_max">
        {token.name}
      </Typography>
      {!isPrimary && (
        <>
          <DisplayInfoInRow label="Policy ID" value={truncateAddressShort(token.id)} textToCopy={token.id} />
          <DisplayInfoInRow label="Fingerprint" value={token.fingerprint} textToCopy={token.fingerprint} />
        </>
      )}

      <Stack width="100%" gap={8}>
        <Typography
          padding={8}
          variant="body1"
          color="ds.text_gray_max"
          bgcolor="ds.gray_200"
          sx={{ borderRadius: '8px', alignSelf: 'flex-start' }}
        >
          Overview
        </Typography>
        <DisplayInfoInRow label="Name" value={token.name} />
        <DisplayInfoInRow label="Tiker" value={token.ticker} />
        <DisplayInfoInRow label="Description" value={token.description || '-'} />
        <DisplayInfoInRow
          label="Details On"
          value={
            <LinkMui
              target="_blank"
              href={
                isPrimary
                  ? explorer.tokenInfo.baseUrl.replace(/^(https?:\/\/[^\/]+)\/.*/, '$1')
                  : `${explorer.tokenInfo.baseUrl}${token.fingerprint}`
              }
              rel="noopener noreferrer"
              sx={{ textDecoration: 'none' }}
            >
              {explorer.tokenInfo.name}
            </LinkMui>
          }
        />
      </Stack>
    </Stack>
  );
};

export default TokenInfoModal;
