// @flow
import type { Node } from 'react';
import { Stack, Typography, styled, Box } from '@mui/material';
import { usePlate } from './plate';
import WalletAccountIcon from '../../topbar/WalletAccountIcon';
import { ReactComponent as InfoIcon } from '../../../assets/images/info-icon-primary.inline.svg';
import type { NetworkRow } from '../../../api/ada/lib/storage/database/primitives/tables';
import WalletChecksumTipsDialog from './WalletChecksumTipsDialog';
import { TIPS_DIALOGS } from './steps';
import type { ManageDialogsProps } from './CreateWalletPage';

const IconWrapper = styled(Box)(({ theme }) => ({
  '& svg': {
    '& path': {
      fill: theme.palette.ds.el_gray_medium,
    },
  },
}));

type Props = {|
  recoveryPhrase: Array<string>,
  selectedNetwork: $ReadOnly<NetworkRow>,
  borderRadius?: number,
  ...ManageDialogsProps,
|};

function WalletPlate(props: Props): Node {
  const { recoveryPhrase, selectedNetwork, openDialog, closeDialog, isDialogOpen, borderRadius } = props;
  const plate = usePlate(recoveryPhrase, selectedNetwork);
  const radius = borderRadius != null && typeof borderRadius === 'number' ? `${borderRadius}px` : '0px';

  const plateImagePart = <WalletAccountIcon iconSeed={plate.ImagePart} saturationFactor={0} size={6} scalePx={4} />;

  return (
    <Stack direction="row" gap="8px" alignItems="center" justifyContent="center" mt="-3px" mb="30px">
      <Box
        sx={{
          '& .identicon': {
            borderRadius: `${radius}`,
          },
        }}
      >
        {plateImagePart}
      </Box>
      <Typography component="div" variant="body1" id="walletPlateText" color="ds.text_gray_medium">
        {plate.TextPart}
      </Typography>
      <IconWrapper
        component="button"
        sx={{
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        onClick={() => openDialog(WalletChecksumTipsDialog)}
      >
        <InfoIcon />
      </IconWrapper>
      <WalletChecksumTipsDialog
        open={isDialogOpen(WalletChecksumTipsDialog)}
        onClose={() => closeDialog(TIPS_DIALOGS.WALLET_CHECKSUM)}
        plateImagePart={plateImagePart}
        plateTextPart={plate.TextPart}
      />
    </Stack>
  );
}
export default WalletPlate;
