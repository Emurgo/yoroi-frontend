// @flow
import { observer } from 'mobx-react';
import React, { Component } from 'react';
import type { Node } from 'react';
import type { WalletWithCachedMeta } from '../../../stores/toplevel/WalletStore';

import styles from './WalletSubRow.scss';

import WalletPlate from './WalletPlate';

type Props = {|
  +publicDeriver: null | WalletWithCachedMeta,
  +walletDetails: Node,
  +walletNumber: number,
  +walletAddresses:  Node,
  +walletCurrencies:  Node,
|};

@observer
export default class WalletSubRow extends Component<Props> {

  render() {
    const {
      publicDeriver,
      walletDetails,
      walletNumber,
      walletAddresses,
      walletCurrencies
    } = this.props;

    const walletName = publicDeriver ? publicDeriver.conceptualWalletName : '';

    return (
      <div className={styles.content}>
        <div className={styles.contentHead}>
          <div className={styles.plateSection}>
            <p className={styles.walletNumber}>{walletNumber}</p>
            <WalletPlate walletName={walletName} publicDeriver={publicDeriver} />
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
