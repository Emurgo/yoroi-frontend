// @flow
import type { Node } from 'react';
import QRCode from 'qrcode.react';
import { useTheme } from '@mui/material';

type Props = {|
  +value: string,
  +size: number,
  +id?: string,
  +includeMargin?: boolean,
|};

const QrCodeWrapper = ({ value, size, id = 'qr-code', includeMargin = false}: Props): Node => {
  const theme = useTheme();

  return (
    <QRCode
      value={value}
      bgColor={theme.palette.ds.white_static}
      fgColor={theme.palette.ds.static_dark}
      size={size}
      includeMargin={includeMargin}
      id={id}
    />
  );
};

export default QrCodeWrapper;
