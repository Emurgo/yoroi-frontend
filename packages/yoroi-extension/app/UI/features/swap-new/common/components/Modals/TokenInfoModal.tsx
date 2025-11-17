import { Stack, Typography, Link as LinkMui } from '@mui/material';
import { TokenInfoIcon } from '../../../../portfolio/common/components/TokenInfoIcon';
import { DisplayInfoInRow } from '../DisplayInfoInRow';
import { isPrimaryToken } from '@yoroi/portfolio';
import { truncateAddressShort } from '../../../../../../utils/formatters';
import { useSwapRevamp } from '../../../module/SwapContextProvider';
import { useStrings } from '../../hooks/useStrings';

const TokenInfoModal = ({ token }) => {
  const isPrimary = isPrimaryToken(token.id);
  const { explorer } = useSwapRevamp();
  const strings = useStrings();
  return (
    <Stack direction="column" gap={16} justifyContent="center" alignItems="center">
      <TokenInfoIcon info={{ id: token.id }} />
      <Typography variant="h5" color="ds.text_gray_max">
        {token.name}
      </Typography>
      {!isPrimary && (
        <>
          <DisplayInfoInRow label="Policy ID" value={truncateAddressShort(token.id)} textToCopy={token.id} tooltipPlace="top" />
          <DisplayInfoInRow label="Fingerprint" value={token.fingerprint} textToCopy={token.fingerprint} tooltipPlace="bottom" />
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
          {strings.overviewLabel}
        </Typography>
        <DisplayInfoInRow label="Name" value={token.name} />
        <DisplayInfoInRow label="Tiker" value={token.ticker} />
        <DisplayInfoInRow label="Description" value={token.description || '-'} />
        <Stack direction="column" gap={4}>
          <Typography variant="body2" color="ds.el_gray_low">
            {strings.detailsOn}
          </Typography>
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
        </Stack>
      </Stack>
    </Stack>
  );
};

export default TokenInfoModal;
