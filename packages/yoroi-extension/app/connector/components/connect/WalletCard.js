// @flow
import { Component } from 'react';
import type { Node } from 'react';
import styles from './WalletCard.scss';
import WalletAccountIcon from '../../../components/topbar/WalletAccountIcon';
import type { WalletChecksum } from '@emurgo/cip4-js';
import type { PublicDeriverCache } from '../../../../chrome/extension/connector/types';
import type { TokenLookupKey } from '../../../api/common/lib/MultiToken';
import type { TokenRow } from '../../../api/ada/lib/storage/database/primitives/tables';
import { assetNameFromIdentifier, getTokenName } from '../../../stores/stateless/tokenHelpers';
import { hiddenAmount } from '../../../utils/strings';

type Props = {|
  +shouldHideBalance: boolean,
  +publicDeriver: PublicDeriverCache,
  +getTokenInfo: $ReadOnly<Inexact<TokenLookupKey>> => ?$ReadOnly<TokenRow>,
|};

function constructPlate(
  plate: WalletChecksum,
  saturationFactor: number,
  divClass: string,
): [string, React$Element<'div'>] {
  return [
    plate.TextPart,
    <div className={divClass}>
      <WalletAccountIcon
        iconSeed={plate.ImagePart}
        saturationFactor={saturationFactor}
        scalePx={6}
        size={5}
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

    const defaultEntry = this.props.publicDeriver.balance.getDefaultEntry();
    const tokenInfo = this.props.getTokenInfo(defaultEntry);
    const numberOfDecimals = tokenInfo ? tokenInfo.Metadata.numberOfDecimals : 0;
    const shiftedAmount = defaultEntry.amount.shiftedBy(-numberOfDecimals);
    const ticker = tokenInfo ? getTokenName(tokenInfo)
      : assetNameFromIdentifier(defaultEntry.identifier);

    const { shouldHideBalance } = this.props;

    return (
      <div className={styles.card}>
        <div className={styles.avatar}>{iconComponent}</div>
        <div className={styles.name}>{this.props.publicDeriver.name}</div>
        <p className={styles.balance}>
          {shouldHideBalance ? hiddenAmount : shiftedAmount.toString()}{' '}
          <span>{ticker}</span>
        </p>
      </div>
    );
  }
}
