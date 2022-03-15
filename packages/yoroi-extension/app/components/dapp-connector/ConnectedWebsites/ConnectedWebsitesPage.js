// @flow
import type { Node } from 'react';
import { Component } from 'react';
import { observer } from 'mobx-react';
import type { WhitelistEntry } from '../../../../chrome/extension/ergo-connector/types'
import styles from './ConnectedWebsitesPage.scss'
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { isErgo } from '../../../api/ada/lib/storage/database/prepackaged/networks';
import WalletRow from './WalletRow';
import type { TokenRow } from '../../../api/ada/lib/storage/database/primitives/tables';
import type { TokenLookupKey, MultiToken } from '../../../api/common/lib/MultiToken';
import type { ConceptualWalletSettingsCache } from '../../../stores/toplevel/WalletSettingsStore';
import type { WalletChecksum } from '@emurgo/cip4-js';
import { PublicDeriver } from '../../../api/ada/lib/storage/models/PublicDeriver'
import NoDApp from './NoDApp';

type WalletInfo = {| balance: null | MultiToken, plate: WalletChecksum |}
type Props = {|
    +whitelistEntries: ?Array<WhitelistEntry>,
    +activeSites: Array<string>,
    +wallets: ?Array<PublicDeriver<>>,
    +onRemoveWallet: {| url: ?string, protocol: ?string |} => void,
    +getTokenInfo: $ReadOnly<Inexact<TokenLookupKey>> => $ReadOnly<TokenRow>,
    +shouldHideBalance: boolean,
    +getConceptualWallet: PublicDeriver<> => ConceptualWalletSettingsCache,
    +getWalletInfo: (PublicDeriver<>) => WalletInfo
|};

@observer
export default class ConnectedWebsitesPage extends Component<Props> {
  render(): Node {
      const { whitelistEntries, wallets } = this.props;
      if (whitelistEntries == null
        || whitelistEntries.length === 0
        || wallets == null
        || wallets.length === 0
      ) {
          return <NoDApp />
      }

      const { ergoNodes, cardanoNodes } = whitelistEntries.map((
        { url, protocol, publicDeriverId, image }
      ) => {
        const wallet = wallets.find( cacheEntry =>
          cacheEntry.getPublicDeriverId() === publicDeriverId
        )
        if (wallet == null) {
          return [null, null]
        }
        const { balance, plate } = this.props.getWalletInfo(wallet)
        return [isErgo(wallet.getParent().getNetworkInfo()), (
          <WalletRow
            key={url}
            url={url}
            protocol={protocol}
            websiteIcon={image}
            isActiveSite={this.props.activeSites.includes(url)}
            onRemoveWallet={this.props.onRemoveWallet}
            balance={balance}
            plate={plate}
            shouldHideBalance={this.props.shouldHideBalance}
            getTokenInfo={this.props.getTokenInfo}
            settingsCache={this.props.getConceptualWallet(wallet)}
          />
        )]
      }).reduce((acc, [isWalletErgo, node]) => {
        if (node != null) {
          acc[isWalletErgo === true ? 'ergoNodes' : 'cardanoNodes'].push(node);
        }
        return acc;
      }, { ergoNodes: [], cardanoNodes: [] });



      return (
        <div className={styles.component}>
          <div className={styles.container}>
            <div className={styles.header}>
              <p>Wallets</p>
              <p>Dapps</p>
            </div>
            <div>
              {cardanoNodes.length > 0 &&
              <div className={styles.chain}>
                <h1>Cardano, ADA</h1>
                {cardanoNodes}
                <div className={styles.line}>
                  <div />
                </div>
              </div>
              }
              {ergoNodes.length > 0 &&
              <div className={styles.chain}>
                <h1>Ergo, ERG</h1>
                {ergoNodes}
              </div>}
            </div>
          </div>
        </div>
      )
  }
}