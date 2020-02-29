// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import type { WalletAccountNumberPlate } from '../../../api/ada/lib/storage/models/PublicDeriver/interfaces';

import styles from './WalletPlate.scss';
import WalletAccountIcon from '../../topbar/WalletAccountIcon';

type Props = {|
  +walletName: string,
  +plate: null | WalletAccountNumberPlate,
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

@observer
export default class WalletPlate extends Component<Props> {

  render() {
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
