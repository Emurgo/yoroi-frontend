import React from 'react';
import { RegistrationStepper } from '../RegistrationStepper';
import { Button, Box, Stack, Typography } from '@mui/material';
import { useStrings } from '../../hooks/useStrings';
import { downloadQrCode } from '../../../../../components/qrCode/helpers';
import QrCode from '../../../../../components/qrCode/QrCode';

type Props = {
  closeModal: () => void;
};

const QR_ID = 'qr-vote';

export const QrCodeStep = ({ closeModal }: Props) => {
  const strings = useStrings();

  const handleDownloadQrCode = () => downloadQrCode(QR_ID, 'Voting key');

  return (
    <Stack direction="column" gap="24px" height="100%" pb="24px">
      <RegistrationStepper />
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          flexGrow: 1,
          justifyContent: 'space-evenly',
          gap: '16px',
        }}
      >
        <Typography color="ds.text_gray_medium">{strings.qrCodeIsTheGeneratedCertificate}</Typography>

        <Typography color="ds.sys_magenta_500">{strings.takeAScreenshot}</Typography>

        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
          <QrCode value={QR_ID} size={200} id={QR_ID} />
        </Box>
      </Box>
      <Box sx={{ display: 'flex', gap: '16px' }}>
        <Button
          // @ts-ignore
          variant="secondary"
          fullWidth
          onClick={closeModal}
        >
          {strings.close}
        </Button>
        <Button
          // @ts-ignore
          variant="primary"
          fullWidth
          onClick={handleDownloadQrCode}
        >
          {strings.qrStepDownload}
        </Button>
      </Box>
    </Stack>
  );
};
