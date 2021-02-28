// @flow
import * as React from 'react';
import type { Node } from 'react';
import styles from './WalletCard.scss';
import WalletAccountIcon from '../../../components/topbar/WalletAccountIcon';
import type { WalletChecksum } from '@emurgo/cip4-js';
import type { AccountInfo, } from '../../../../chrome/extension/ergo-connector/types';

type WalletCardProps = AccountInfo;

const WalletCard = ({ name, balance }: WalletCardProps): Node => {
  function constructPlate(
    plate: WalletChecksum,
    saturationFactor: number,
    divClass: string
  ): [string, React$Element<'div'>] {
    return [
      plate.TextPart,
      <div className={divClass}>
        <WalletAccountIcon
          iconSeed={plate.ImagePart}
          saturationFactor={saturationFactor}
          scalePx={6}
        />
      </div>,
    ];
  }

  throw new Error(`${nameof(WalletCard)} missing code to generate plate`);

  const [_, iconComponent] = plate ? constructPlate(plate, 0, styles.icon) : [];

  return (
    <div className={styles.card}>
      <div className={styles.avatar}>{iconComponent}</div>
      <div className={styles.name}>{name}</div>
      <p className={styles.balance}>
        {balance} <span>ERG</span>
      </p>
    </div>
  );
};

export default WalletCard;
