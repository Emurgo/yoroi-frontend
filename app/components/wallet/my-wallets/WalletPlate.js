// @flow
import React, { Component } from 'react';
import type { WalletWithCachedMeta } from '../../../stores/toplevel/WalletStore';
import type { WalletAccountNumberPlate } from '../../../api/ada/lib/storage/models/PublicDeriver/interfaces';

import styles from './WalletPlate.scss';
import WalletAccountIcon from '../../topbar/WalletAccountIcon';

type Props = {|
  +walletName: string,
  +publicDeriver: null | WalletWithCachedMeta,
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

export default class WalletPlate extends Component<Props> {

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
