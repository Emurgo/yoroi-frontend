import React from 'react';
import { Box, Typography, styled } from '@mui/material';
import type { ConnectedWalletProps } from '../../types/connect';
import type { WalletChecksum } from '../../types/wallet';
import WalletAccountIcon from '../../../../../components/topbar/WalletAccountIcon';

const Card = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-start',
  width: '100%',
  padding: '12px',
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
  },
});

const Wrapper = styled('div')({
  display: 'flex',
  alignItems: 'center',
  width: '100%',
});

const Avatar = styled('div')({
  marginRight: '8px',
  borderRadius: '4px',
  overflow: 'hidden',
  objectFit: 'cover',
  height: '40px',
  width: '40px',
});

const IconWrapper = styled('div')({
  width: '40px',
  height: '40px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

const NameWrapper = styled('div')({
  display: 'flex',
  flexFlow: 'column',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  height: '100%',
});

const Checksum = styled('div')({
  color: '#6b7384',
  marginTop: '8px',
  fontSize: '14px',
});

const constructPlate = (
  plate: WalletChecksum,
  saturationFactor: number,
  IconComponent: typeof IconWrapper
): [string, React.ReactElement] => {
  return [
    plate.TextPart,
    <IconComponent key={plate.TextPart}>
      <WalletAccountIcon
        iconSeed={plate.ImagePart}
        saturationFactor={saturationFactor}
        scalePx={6}
      />
    </IconComponent>,
  ];
};

export const ConnectedWallet: React.FC<ConnectedWalletProps> = ({ 
  publicDeriver,
  walletBalance,
  onClick
}) => {
  const [, iconComponent] = publicDeriver.plate
    ? constructPlate(publicDeriver.plate, 0, IconWrapper)
    : ['', <IconWrapper key="default" />];

  const checksum = publicDeriver.plate?.TextPart;

  return (
    <Card onClick={onClick}>
      <Wrapper>
        <Avatar>{iconComponent}</Avatar>
        <NameWrapper>
          <Typography
            component="div"
            color="#242838"
            fontWeight="500"
            variant="body1"
            fontSize={16}
            id="connectedWalletName"
          >
            {publicDeriver.name}
          </Typography>
          {checksum && <Checksum id="connectedWalletPlate">{checksum}</Checksum>}
        </NameWrapper>
        {walletBalance != null && (
          <Box sx={{ ml: 'auto' }}>
            <Typography>{walletBalance}</Typography>
          </Box>
        )}
      </Wrapper>
    </Card>
  );
};

export default ConnectedWallet; 