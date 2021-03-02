// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import styles from './WalletCard.scss';
import WalletAccountIcon from '../../../components/topbar/WalletAccountIcon';
import type { WalletChecksum } from '@emurgo/cip4-js';
import type { AccountInfo, } from '../../../../chrome/extension/ergo-connector/types';

type Props = {|
  +accountInfo: AccountInfo,
|};

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

export default class WalletCard extends Component<Props> {

  render(): Node {
    const [_, iconComponent] = this.props.accountInfo.checksum
      ? constructPlate(this.props.accountInfo.checksum, 0, styles.icon)
      : [];

    return (
      <div className={styles.card}>
        <div className={styles.avatar}>{iconComponent}</div>
        <div className={styles.name}>{this.props.accountInfo.name}</div>
        <p className={styles.balance}>
          {this.props.accountInfo.balance} <span>ERG</span>
        </p>
      </div>
    );
  }
}
