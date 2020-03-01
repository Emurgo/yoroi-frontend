// @flow
import { observer } from 'mobx-react';
import React, { Component } from 'react';
import type { Node } from 'react';
import type { WalletAccountNumberPlate } from '../../../api/ada/lib/storage/models/PublicDeriver/interfaces';

import styles from './WalletSubRow.scss';

import WalletPlate from './WalletPlate';

type Props = {|
  +walletInfo: {|
    +conceptualWalletName: string,
    +plate: null | WalletAccountNumberPlate,
  |},
  +walletDetails: Node,
  +walletNumber: number,
  +walletAddresses:  Node,
  +walletCurrencies:  Node,
|};

@observer
export default class WalletSubRow extends Component<Props> {

  render() {
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
            <p className={styles.walletNumber}>{walletNumber}</p>
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
