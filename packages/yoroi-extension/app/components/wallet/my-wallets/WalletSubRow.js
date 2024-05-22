// @flow
import { observer } from 'mobx-react';
import { Component } from 'react';
import type { Node } from 'react';
import type { WalletChecksum } from '@emurgo/cip4-js';

import styles from './WalletSubRow.scss';

import WalletPlate from './WalletPlate';

type Props = {|
  +walletInfo: {|
    +conceptualWalletName: string,
    +plate: null | WalletChecksum,
  |},
  +walletDetails: Node,
  +walletNumber: number,
  +walletAddresses:  Node,
  +walletCurrencies:  Node,
|};

@observer
export default class WalletSubRow extends Component<Props> {

  render(): Node {
    const {
      walletInfo,
      walletDetails,
      walletNumber,
      walletAddresses,
      walletCurrencies
    } = this.props;

    return (
      <div className={styles.content}>
        <div className={styles.contentHead}>
          <div className={styles.plateSection}>
            <div className={styles.walletNumber}>{walletNumber}</div>
            <WalletPlate
              walletName={walletInfo.conceptualWalletName}
              plate={walletInfo.plate}
            />
          </div>
          <div className={styles.detailsSection}>
            {walletDetails}
          </div>
          <div className={styles.currencySection}>
            {walletCurrencies}
          </div>
        </div>
        <div className={styles.contentBody}>
          {walletAddresses}
        </div>
      </div>
    );
  }
}
