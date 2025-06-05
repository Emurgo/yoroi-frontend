import type { WalletState } from '../../../../../../chrome/extension/background/types';
import { useState } from 'react';
import { Box, Typography } from '@mui/material';
import { Icons, IconWrapper } from '../../../../components';
import { constructPlate40 } from '../../../../../components/topbar/WalletCard';
import { useDappConnections } from '../hooks/useDappConnections';

interface ConnectionRowProps {
  id: string;
  url: string;
  image: string;
  wallet: WalletState;
  balance: string;
  tokenName: string;
}

const ConnectionRow = ({ id, url, image, wallet, balance, tokenName }: ConnectionRowProps) => {
  const { removeWalletFromWhitelist } = useDappConnections();
  const [showDeleteIcon, setShowDeleteIcon] = useState(false);

  const { plate, name: walletName } = wallet;
  const [, plateIcon] = constructPlate40(plate);

  const setDeleteIconVisible = () => setShowDeleteIcon(true);
  const setDeleteIconHidden = () => setShowDeleteIcon(false);

  return (
    <Box
      id={id}
      onMouseOver={setDeleteIconVisible}
      onFocus={setDeleteIconVisible}
      onMouseLeave={setDeleteIconHidden}
      sx={{
        width: '100%',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '24px',
        alignItems: 'center',
        color: 'ds.gray_800',
        padding: '8px',
        borderRadius: '8px',
        '&:hover': {
          backgroundColor: 'ds.bg_color_contrast_min',
        },
      }}
    >
      <Box width="100%" display="flex" alignItems="center" gap="8px">
        <Box>{plateIcon}</Box>
        <Box display="flex" flexDirection="column">
          <Typography component="div" variant="caption" color="grayscale.900" id="connectedWalletNameLabel">
            {walletName}
          </Typography>
          <Typography color="ds.text_gray_medium" variant="body2" fontWeight={500} id="connectedWalletBalanceLabel">
            {balance} {tokenName}
          </Typography>
        </Box>
      </Box>
      <Box width="100%" position="relative" display="flex" alignItems="center">
        <Box display="flex" alignItems="center" gap="16px">
          <Box width="32px" height="32px" borderRadius="50%" overflow="hidden">
            <img src={image} alt="dapp-icon" width="100%" />
          </Box>
          <Box>{url}</Box>
        </Box>
        {showDeleteIcon && (
          <Box position="absolute" right="0" top="50%" sx={{ transform: 'translateY(-50%)', cursor: 'pointer' }}>
            <IconWrapper icon={Icons.Delete} onClick={() => removeWalletFromWhitelist(url)} />
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default ConnectionRow;
