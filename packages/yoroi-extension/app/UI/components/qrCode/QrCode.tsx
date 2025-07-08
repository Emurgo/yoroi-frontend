import React from 'react';
import QRCodeReact from 'qrcode.react';
import { useTheme } from '@mui/material';

type QrCodeProps = {
  value: string;
  size: number;
  id?: string;
  includeMargin?: boolean;
};

const QrCode = ({ value, size, id = 'qr-code', includeMargin = false }: QrCodeProps): React.ReactNode => {
  const theme = useTheme();

  return (
    <QRCodeReact
      value={value}
      // @ts-ignore
      bgColor={theme.palette.ds.white_static}
      // @ts-ignore
      fgColor={theme.palette.ds.black_static}
      size={size}
      includeMargin={includeMargin}
      id={id}
    />
  );
};

export default QrCode;
