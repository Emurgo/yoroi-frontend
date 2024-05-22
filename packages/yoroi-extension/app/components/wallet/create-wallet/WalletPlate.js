// @flow
import type { Node } from 'react';
import { Stack, Typography } from '@mui/material';
import { Box } from '@mui/system';
import { usePlate } from './plate';
import WalletAccountIcon from '../../topbar/WalletAccountIcon';
import { ReactComponent as InfoIcon } from '../../../assets/images/info-icon-primary.inline.svg';
import type { NetworkRow } from '../../../api/ada/lib/storage/database/primitives/tables';
import WalletChecksumTipsDialog from './WalletChecksumTipsDialog';
import { TIPS_DIALOGS } from './steps';
import type { ManageDialogsProps } from './CreateWalletPage';

type Props = {|
  recoveryPhrase: Array<string>,
  selectedNetwork: $ReadOnly<NetworkRow>,
  ...ManageDialogsProps,
|};

function WalletPlate(props: Props): Node {
  const { recoveryPhrase, selectedNetwork, openDialog, closeDialog, isDialogOpen } = props;
  const plate = usePlate(recoveryPhrase, selectedNetwork);

  const plateImagePart = (
    <WalletAccountIcon iconSeed={plate.ImagePart} saturationFactor={0} size={6} scalePx={4} />
  );

  return (
    <Stack
      direction="row"
      gap="8px"
      alignItems="center"
      justifyContent="center"
      mt="-3px"
      mb="30px"
    >
      {plateImagePart}
      <Typography component="div" variant="body1" id="walletPlateText">{plate.TextPart}</Typography>
      <Box
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
      </Box>
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
