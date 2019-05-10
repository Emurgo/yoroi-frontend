// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import styles from './WalletAccountIcon.scss';
import Blockies from 'react-blockies';
import tinycolor from 'tinycolor2';

type Props = {
  iconSeed: string,
  scalePx?: number,
  saturationFactor?: number,
};

const mkcolor = (primary, secondary, spots) => ({ primary, secondary, spots });
const COLORS = [
  mkcolor('#E1F2FF', '#17D1AA', '#A80B32'),
  mkcolor('#E1F2FF', '#FA5380', '#0833B2'),
  mkcolor('#E1F2FF', '#f06ef5', '#0804f7'),
  mkcolor('#E1F2FF', '#ebb687', '#852d62'),
  mkcolor('#E1F2FF', '#eda9a5', '#43327a'),
];

const saturation = (color, factor: number = 10) => {
  if (factor < 0 || factor > 20) {
    throw Error("Expected factor between 0 and 20 (default 10)")
  }
  const diff = factor - 10;
  let tcol = tinycolor(color);
  for (let i = 0; i < Math.abs(diff); i++) {
    tcol = diff < 0 ?
      tcol.desaturate()
      : tcol.saturate();
  }
  return tcol.toHexString();
};

/** Dynamically generated title for the topbar when a wallet is selected */
@observer
export default class WalletAccountIcon extends Component<Props> {
  static defaultProps = {
    formattedWalletAmount: undefined
  };

  render() {
    const { iconSeed, scalePx, saturationFactor } = this.props;
    const colorIdx = Buffer.from(iconSeed, 'hex')[0] % COLORS.length;
    const color = COLORS[colorIdx];
    return (<Blockies
      seed={iconSeed}
      size={7}
      scale={scalePx || 5}
      bgColor={saturation(color.primary, saturationFactor)}
      color={saturation(color.secondary, saturationFactor)}
      spotColor={saturation(color.spots, saturationFactor)}
      className={styles.walletIcon}
    />);
  }
}
