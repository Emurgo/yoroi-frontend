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
    addBg: false,
  }

  render(): Node {
    // Get QRCode color value from active theme's CSS variable
    const qrCodeBackgroundColor = readCssVar('--yoroi-qr-code-background');
    const qrCodeForegroundColor = readCssVar('--yoroi-qr-code-foreground');
    const { id, includeMargin, addBg } = this.props;

    return (
      <QRCode
        value={this.props.value}
        bgColor={addBg && qrCodeBackgroundColor}
        fgColor={addBg && qrCodeForegroundColor}
        size={this.props.size}
        includeMargin={includeMargin === true}
        id={id}
      />
    );
  }
}
