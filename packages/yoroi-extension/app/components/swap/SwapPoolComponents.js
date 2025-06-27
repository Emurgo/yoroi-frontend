// @flow
import { Box, Typography } from '@mui/material';
import { ReactComponent as DefaultToken } from '../../assets/images/revamp/token-default.inline.svg';
import { ReactComponent as MinswapImage } from '../../assets/images/revamp/dex/minswap.inline.svg';
import { ReactComponent as SundaeImage } from '../../assets/images/revamp/dex/sundae.inline.svg';
import { ReactComponent as MuesliImage } from '../../assets/images/revamp/dex/muesli.inline.svg';
import { ReactComponent as SpecImage } from '../../assets/images/revamp/dex/spec.inline.svg';
import { ReactComponent as VyfiImage } from '../../assets/images/revamp/dex/vyfi.inline.svg';
import { ReactComponent as WingridersImage } from '../../assets/images/revamp/dex/wingriders.inline.svg';
import { useStrings } from '../../containers/swap/common/useStrings';

const poolIcons = {
  muesliswap: <MuesliImage />,
  muesliswap_v1: <MuesliImage />,
  muesliswap_v2: <MuesliImage />,
  muesliswap_v3: <MuesliImage />,
  muesliswap_v4: <MuesliImage />,
  minswap: <MinswapImage />,
  sundaeswap: <SundaeImage />,
  wingriders: <WingridersImage />,
  vyfi: <VyfiImage />,
  spectrum: <SpecImage />,
};

export function SwapPoolIcon({ provider }: {| +provider: string |}): React$Node {
  return (
    <Box
      sx={{
        width: '24px',
        height: '24px',
        borderRadius: '8px',
        overflow: 'hidden',
      }}
    >
      {poolIcons[provider] || <DefaultToken />}
    </Box>
  );
}

export function SwapPoolLabel({ provider, isAutoPool = false }: {| +provider: any, +isAutoPool?: boolean |}): React$Node {
  const strings = useStrings();
  return (
    <Box display="flex" alignItems="center" gap="8px">
      <Box display="inline-flex">
        <SwapPoolIcon provider={provider} />
      </Box>
      <Typography component="div" variant="body1" color="ds.text_primary_medium" fontWeight={500}>
        {provider} {isAutoPool ? strings.auto : null}
      </Typography>
    </Box>
  );
}
