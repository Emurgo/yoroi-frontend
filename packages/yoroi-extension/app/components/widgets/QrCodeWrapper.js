// @flow
import { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import QRCode from 'qrcode.react';

type Props = {|
  +value: string,
  +size: number,
|};

function readCssVar(varName: string): string {
  varName = varName.startsWith('--') ? varName : '--' + varName;
  return window.getComputedStyle(document.documentElement).getPropertyValue(varName);
}

@observer
export default class QrCodeWrapper extends Component<Props> {
  render(): Node {
    // Get QRCode color value from active theme's CSS variable
    const qrCodeBackgroundColor = readCssVar('--th-qr-code-background');
    const qrCodeForegroundColor = readCssVar('--th-qr-code-foreground');

    return (
      <QRCode
        value={this.props.value}
        bgColor={qrCodeBackgroundColor}
        fgColor={qrCodeForegroundColor}
        size={this.props.size}
      />
    );
  }
}
