// @flow
import { Box } from '@mui/material';
import { ReactComponent as DefaultToken } from '../../assets/images/revamp/token-default.inline.svg';
import { ReactComponent as MinswapImage } from '../../assets/images/revamp/dex/minswap.inline.svg';
import { ReactComponent as SundaeImage } from '../../assets/images/revamp/dex/sundae.inline.svg';
import { ReactComponent as MuesliImage } from '../../assets/images/revamp/dex/muesli.inline.svg';
import { ReactComponent as SpecImage } from '../../assets/images/revamp/dex/spec.inline.svg';
import { ReactComponent as VyfiImage } from '../../assets/images/revamp/dex/vyfi.inline.svg';
import { ReactComponent as WingridersImage } from '../../assets/images/revamp/dex/wingriders.inline.svg';

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

type Props = {|
  +provider: string,
|}

export default function SwapPoolIcon({ provider }: Props): React$Node {
  return (
    <Box sx={{ width: '24px', height: '24px' }}>{poolIcons[provider] || <DefaultToken />}</Box>
  );
}
