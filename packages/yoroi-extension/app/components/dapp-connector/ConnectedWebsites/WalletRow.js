// @flow

import { Component } from 'react'
import styles from './WalletRow.scss'
import WalletAccountIcon from '../../topbar/WalletAccountIcon';
import type { WalletChecksum } from '@emurgo/cip4-js';
import type { PublicDeriverCache } from '../../../../chrome/extension/ergo-connector/types';
import type { TokenLookupKey } from '../../../api/common/lib/MultiToken';
import type { TokenRow } from '../../../api/ada/lib/storage/database/primitives/tables';
import { getTokenName } from '../../../stores/stateless/tokenHelpers';
import { hiddenAmount } from '../../../utils/strings';

type Props = {|
    +url: ?string,
    +isActiveSite: boolean,
    +wallet: PublicDeriverCache,
    +shouldHideBalance: boolean,
    +onRemoveWallet: ?string => void,
    +getTokenInfo: $ReadOnly<Inexact<TokenLookupKey>> => $ReadOnly<TokenRow>,
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

export default class WalletRow extends Component<Props> {

    render(){
        const {
        isActiveSite,
        url,
        wallet,
        onRemoveWallet,
        shouldHideBalance,
        getTokenInfo,
        } = this.props;
        // eslint-disable-next-line no-unused-vars
        const [_, iconComponent] = wallet.checksum
        ? constructPlate(wallet.checksum, 0, styles.icon)
        : [];

        const defaultEntry = wallet.balance.getDefaultEntry();
        const tokenInfo = getTokenInfo(defaultEntry);
        const shiftedAmount = defaultEntry.amount
        .shiftedBy(-tokenInfo.Metadata.numberOfDecimals);

        return (
          <div className={styles.component}>
            <div>
              <p className={styles.name}>{wallet.name} &#xb7; Paper Wallet</p>
              <div className={styles.card}>
                <div className={styles.avatar}>{iconComponent}</div>
                <p className={styles.balance}>
                  {shouldHideBalance ? hiddenAmount : shiftedAmount.toString()}{' '}
                  <span>{getTokenName(tokenInfo)}</span>
                </p>
              </div>
            </div>
            <div>
              The dapp
            </div>
          </div>
        )
    }
}