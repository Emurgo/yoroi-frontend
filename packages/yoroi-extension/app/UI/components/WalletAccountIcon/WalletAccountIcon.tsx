import { observer } from 'mobx-react';
import React from 'react';
import Blockies from 'react-blockies';
import tinycolor from 'tinycolor2';

type WalletAccountIconProps = {
  iconSeed: string;
  scalePx?: number;
  size?: number;
  saturationFactor?: number;
};

const mkcolor = (primary: string, secondary: string, spots: string) => ({
  primary,
  secondary,
  spots,
});

const COLORS = [
  mkcolor('#E1F2FF', '#17D1AA', '#A80B32'),
  mkcolor('#E1F2FF', '#FA5380', '#0833B2'),
  mkcolor('#E1F2FF', '#F06EF5', '#0804F7'),
  mkcolor('#E1F2FF', '#EBB687', '#852D62'),
  mkcolor('#E1F2FF', '#F59F9A', '#085F48'),
];

const saturation = (color: string | undefined, factor: number = 0): string => {
  if (!color) return '#000000'; // Default to black if the color is undefined
  if (factor < -100 || factor > 100) {
    throw new Error('Expected factor between -100 and 100 (default 0)');
  }
  let tcol = tinycolor(color);
  for (let i = 0; i < Math.abs(factor); i++) {
    tcol = factor < 0 ? tcol.desaturate() : tcol.saturate();
  }
  return tcol.toHexString();
};

const WalletAccountIcon: React.FC<WalletAccountIconProps> = observer(
  ({ iconSeed, scalePx = 5, size = 7, saturationFactor = 0 }) => {
    if (iconSeed === '') {
      return <div style={{ width: '42px', height: '42px' }} />;
    }

    const colorIdx = (hexToBytes(iconSeed)[0] ?? 0) % COLORS.length;
    const color = COLORS[colorIdx] ?? mkcolor('#FFFFFF', '#000000', '#888888'); // Default fallback colors

    return (
      <Blockies
        seed={iconSeed}
        size={size}
        scale={scalePx}
        bgColor={saturation(color.primary, saturationFactor)}
        color={saturation(color.secondary, saturationFactor)}
        spotColor={saturation(color.spots, saturationFactor)}
      />
    );
  }
);

export default WalletAccountIcon;

export function hexToBytes(hex: string): Uint8Array {
  // Safeguard against invalid hex strings
  if (!/^[0-9a-fA-F]+$/.test(hex) || hex.length % 2 !== 0) {
    throw new Error('Invalid hex string');
  }
  return Uint8Array.from(Buffer.from(hex, 'hex'));
}
