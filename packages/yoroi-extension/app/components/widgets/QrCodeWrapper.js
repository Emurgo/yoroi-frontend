// @flow
import { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import QRCode from 'qrcode.react';
import { readCssVar } from '../../styles/utils';

type Props = {|
  +value: string,
  +size: number,
  +id?: string,
  +includeMargin?: boolean,
  +addBg?: boolean
|};

@observer
export default class QrCodeWrapper extends Component<Props> {

  static defaultProps: {|
    id: string,
    includeMargin: boolean,
    addBg: boolean,
  |} = {
    id: 'qr-code',
    includeMargin: false,
    addBg: true,
  }

  render(): Node {
    // Get QRCode color value from active theme's CSS variable
    const { id, includeMargin, addBg } = this.props;
    const qrCodeBackgroundColor = addBg ? readCssVar('--yoroi-qr-code-background') : '#ffffff';
    const qrCodeForegroundColor = readCssVar('--yoroi-qr-code-foreground');

    return (
      <QRCode
        value={this.props.value}
        bgColor={qrCodeBackgroundColor}
        fgColor={qrCodeForegroundColor}
        size={this.props.size}
        includeMargin={includeMargin === true}
        id={id}
      />
    );
  }
}
