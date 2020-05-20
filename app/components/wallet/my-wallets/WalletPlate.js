// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import type { WalletChecksum } from '@emurgo/cip4-js';

import styles from './WalletPlate.scss';
import WalletAccountIcon from '../../topbar/WalletAccountIcon';

type Props = {|
  +walletName: string,
  +plate: null | WalletChecksum,
|};

function constructPlate(
  plate: WalletChecksum,
  saturationFactor: number,
  divClass: string,
): [string, React$Element<'div'>] {
  return [plate.TextPart, (
    <div className={divClass}>
      <WalletAccountIcon
        iconSeed={plate.ImagePart}
        saturationFactor={saturationFactor}
      />
    </div>
  )];
}

@observer
export default class WalletPlate extends Component<Props> {

  render(): Node {
    const { plate, walletName } = this.props;

    const [accountPlateId, iconComponent] = (plate) ?
      constructPlate(plate, 0, styles.icon)
      : [];

    return (
      <div className={styles.wrapper}>
        {iconComponent}
        <div className={styles.content}>
          <h3 className={styles.name}>{walletName}</h3>
          {accountPlateId}
        </div>
      </div>
    );
  }
}
