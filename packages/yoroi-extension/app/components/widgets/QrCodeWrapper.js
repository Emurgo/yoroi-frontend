// @flow
import { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import QRCode from 'qrcode.react';
import { readCssVar } from '../../styles/utils';

type Props = {|
  +value: string,
  +size: number,
|};

@observer
export default class QrCodeWrapper extends Component<Props> {
  render(): Node {
    // Get QRCode color value from active theme's CSS variable
    const qrCodeBackgroundColor = readCssVar('--yoroi-qr-code-background');
    const qrCodeForegroundColor = readCssVar('--yoroi-qr-code-foreground');

    return (
      <QRCode
        value={this.props.value}
        bgColor={qrCodeBackgroundColor}
        fgColor={qrCodeForegroundColor}
        size={this.props.size}
        id="qr-code"
      />
    );
  }
}
