// @flow
import type { Node } from 'react';
import { Component } from 'react';
import { observer } from 'mobx-react';
import styles from './WalletAccountIcon.scss';
import Blockies from 'react-blockies';
import tinycolor from 'tinycolor2';

type Props = {|
  +iconSeed: string,
  +scalePx?: number,
  +size?: number,
  +saturationFactor?: number,
|};

const mkcolor = (primary, secondary, spots) => ({ primary, secondary, spots });
const COLORS = [
  mkcolor('#E1F2FF', '#17D1AA', '#A80B32'),
  mkcolor('#E1F2FF', '#FA5380', '#0833B2'),
  mkcolor('#E1F2FF', '#F06EF5', '#0804F7'),
  mkcolor('#E1F2FF', '#EBB687', '#852D62'),
  mkcolor('#E1F2FF', '#F59F9A', '#085F48'),
];

const saturation = (color, factor: number = 0) => {
  if (factor < -100 || factor > 100) {
    throw Error('Expected factor between -100 and 100 (default 0)');
  }
  let tcol = tinycolor(color);
  for (let i = 0; i < Math.abs(factor); i++) {
    tcol = factor < 0 ?
      tcol.desaturate()
      : tcol.saturate();
  }
  return tcol.toHexString();
};

/** Dynamically generated title for the topbar when a wallet is selected */
@observer
export default class WalletAccountIcon extends Component<Props> {
  static defaultProps: {|saturationFactor: number, scalePx: number, size: number|} = {
    scalePx: 5,
    saturationFactor: 0,
    size: 7
  };

  render(): Node {
    const { iconSeed, scalePx, size, saturationFactor } = this.props;
    if (iconSeed === '') {
      return (<div style={{ width: '42px', height: '42px' }} />);
    }
    const colorIdx = Buffer.from(iconSeed, 'hex')[0] % COLORS.length;
    const color = COLORS[colorIdx];
    return (<Blockies
      seed={iconSeed}
      size={size}
      scale={scalePx != null ? scalePx : 5}
      bgColor={saturation(color.primary, saturationFactor)}
      color={saturation(color.secondary, saturationFactor)}
      spotColor={saturation(color.spots, saturationFactor)}
      className={styles.walletIcon}
    />);
  }
}
