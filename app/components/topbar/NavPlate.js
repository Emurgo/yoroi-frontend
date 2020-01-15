// @flow
import React, { Component } from 'react';
import PublicDeriverWithCachedMeta from '../../domain/PublicDeriverWithCachedMeta';
import type { WalletAccountNumberPlate } from '../../api/ada/lib/storage/models/PublicDeriver/interfaces';

import styles from './NavPlate.scss';
import WalletAccountIcon from './WalletAccountIcon';

type Props = {|
  +walletName: string,
  +publicDeriver: null | PublicDeriverWithCachedMeta,
  +walletType: 'conceptual' | 'paper' | 'trezor',
|};

function constructPlate(
  plate: WalletAccountNumberPlate,
  saturationFactor: number,
  divClass: string,
): [string, React$Element<'div'>] {
  return [plate.id, (
    <div className={divClass}>
      <WalletAccountIcon
        iconSeed={plate.hash}
        saturationFactor={saturationFactor}
      />
    </div>
  )];
}

export default class NavPlate extends Component<Props> {

  render() {
    const { publicDeriver, walletName } = this.props;

    const [accountPlateId, iconComponent] = (publicDeriver && publicDeriver.plate) ?
      constructPlate(publicDeriver.plate, 0, styles.icon)
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
