// @flow
import type { Node } from 'react';
import QRCode from 'qrcode.react';
import { useTheme } from '@mui/material';

type Props = {|
  +value: string,
  +size: number,
  +id?: string,
  +includeMargin?: boolean,
  +addBg?: boolean,
  +fgColor?: string,
|};

const QrCodeWrapper = ({ value, size, id = 'qr-code', includeMargin = false, addBg = true }: Props): Node => {
  const theme = useTheme();
  console.log('theme', theme);
  // Get QRCode color value from active theme's CSS variable
  const qrCodeBackgroundColor = addBg ? theme.palette.ds.el_gray_max : '#ffffff';
  const qrCodeForegroundColor = theme.palette.ds.gray_min;

  return (
    <QRCode
      value={value}
      bgColor={qrCodeBackgroundColor}
      fgColor={qrCodeForegroundColor}
      size={size}
      includeMargin={includeMargin}
      id={id}
    />
  );
};

export default QrCodeWrapper;
