// @flow
import * as React from 'react';
import type { Node } from 'react';
import styles from './WalletCard.scss';
import WalletAccountIcon from '../../../components/topbar/WalletAccountIcon';

type WalletCardProps = {|
  name: string,
  balance: string,
|};

const WalletCard = ({ name, balance }: WalletCardProps): Node => {
  function constructPlate(
    plate: any,
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
  // TODO: fix hardcoded avatar
  const plate = {
    ImagePart:
      '3f7eed82d34103f119b551f2705fae269b0cf02e6522a7935c95fe471dc8a17ef916d9f89ad04e4086ec91bfa36d9a4df730a5988139a5e5d53fa72e0b682b66',
    TextPart: 'KJSK-5546',
  };

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
