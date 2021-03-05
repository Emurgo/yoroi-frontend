// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import QRCode from 'qrcode.react';

type Props = {|
  +value: string,
  +size: number,
|};

@observer
export default class QrCodeWrapper extends Component<Props> {
  render(): Node {

    // Get QRCode color value from active theme's CSS variable
    const qrCodeBackgroundColor = document.documentElement ?
      document.documentElement.style.getPropertyValue('--theme-receive-qr-code-background-color') : 'transparent';
    const qrCodeForegroundColor = document.documentElement ?
      document.documentElement.style.getPropertyValue('--theme-receive-qr-code-foreground-color') : '#000';

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
