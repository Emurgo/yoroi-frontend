// @flow
import { Component } from 'react';
import type { Node } from 'react';
import { Chip, Typography } from '@mui/material';
import styles from './ConnectedWallet.scss';
import WalletAccountIcon from '../../../components/topbar/WalletAccountIcon';
import type { WalletChecksum } from '@emurgo/cip4-js';
import type { PublicDeriverCache } from '../../../../chrome/extension/ergo-connector/types';
import type { TokenLookupKey } from '../../../api/common/lib/MultiToken';
import type { TokenRow } from '../../../api/ada/lib/storage/database/primitives/tables';

type Props = {|
  +publicDeriver: PublicDeriverCache,
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
        scalePx={9}
        size={8}
      />
    </div>,
  ];
}

export default class WalletCard extends Component<Props> {
  render(): Node {
    // eslint-disable-next-line no-unused-vars
    const [_, iconComponent] = this.props.publicDeriver.checksum
      ? constructPlate(this.props.publicDeriver.checksum, 0, styles.icon)
      : [];

    const checksum = this.props.publicDeriver.checksum?.TextPart;

    return (
      <div className={styles.card}>
        <div className={styles.wrapper}>
          <div className={styles.avatar}>{iconComponent}</div>
          <div className={styles.nameWrapper}>
            <Typography color="#242838" fontWeight="500" variant="b1" fontSize={16}>
              {this.props.publicDeriver.name}
            </Typography>
            <div className={styles.checksum}>{checksum}</div>
          </div>
        </div>
      </div>
    );
  }
}
