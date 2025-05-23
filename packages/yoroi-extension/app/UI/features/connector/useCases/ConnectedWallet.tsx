import React from 'react';
import { WalletStateType } from '../types';
import { Box, Typography } from '@mui/material';
import { WalletChecksum } from '@emurgo/cip4-js';
import WalletAccountIcon from '../../../../components/topbar/WalletAccountIcon';

function constructPlate(plate: WalletChecksum, saturationFactor: number): [string, React.ReactElement] {
  return [
    plate.TextPart,
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <WalletAccountIcon iconSeed={plate.ImagePart} saturationFactor={saturationFactor} scalePx={6} />
    </Box>,
  ];
}

interface ConnectedWalletProps {
  publicDeriver: WalletStateType;
  walletBalance?: React.ReactNode;
  disabledForReason?: string | null;
}

const ConnectedWallet: React.FC<ConnectedWalletProps> = ({ publicDeriver, walletBalance, disabledForReason }) => {
  const [_, iconComponent] = publicDeriver.plate ? constructPlate(publicDeriver.plate, 0) : [undefined, undefined];

  const checksum = publicDeriver.plate?.TextPart;

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-start',
          width: '100%',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '16px', width: '100%' }}>
          {iconComponent}
          <Box sx={{ display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
            <Typography
              component="div"
              color="text.primary"
              fontWeight="500"
              variant="body1"
              fontSize={16}
              id="connectedWalletName"
            >
              {publicDeriver.name}
            </Typography>
            <Typography color="text.secondary" sx={{ textAlign: 'left', fontSize: '14px' }} id="connectedWalletPlate">
              {checksum}
            </Typography>
          </Box>
          {walletBalance != null && <Box sx={{ ml: 'auto', flexGrow: 1 }}>{walletBalance}</Box>}
        </Box>
      </Box>
      {disabledForReason && (
        <Box
          sx={{
            color: 'ds.sys_magenta_500',
            fontSize: '12px',
            fontWeight: 400,
            lineHeight: '16px',
          }}
        >
          {disabledForReason}
        </Box>
      )}
    </>
  );
};

export default ConnectedWallet;
