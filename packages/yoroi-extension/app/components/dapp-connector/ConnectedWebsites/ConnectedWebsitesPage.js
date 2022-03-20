// @flow
import type { Node } from 'react';
import { Component } from 'react';
import { observer } from 'mobx-react';
import type { WhitelistEntry } from '../../../../chrome/extension/ergo-connector/types'
import styles from './ConnectedWebsitesPage.scss'
import { isErgo } from '../../../api/ada/lib/storage/database/prepackaged/networks';
import WalletRow from './WalletRow';
import type { TokenRow } from '../../../api/ada/lib/storage/database/primitives/tables';
import type { TokenLookupKey, MultiToken } from '../../../api/common/lib/MultiToken';
import type { ConceptualWalletSettingsCache } from '../../../stores/toplevel/WalletSettingsStore';
import type { WalletChecksum } from '@emurgo/cip4-js';
import { PublicDeriver } from '../../../api/ada/lib/storage/models/PublicDeriver'
import NoDApp from './NoDApp';
import { Box } from '@mui/system';
import { BRANDED_DAPPS } from './dapps';
import DApp from './DApp';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { defineMessages, intlShape } from 'react-intl';

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

const messages = defineMessages({
  wallets: {
    id: 'connector.connectedwebsites.table.wallets',
    defaultMessage: `!!!Wallets`,
  },
  dApps: {
    id: 'connector.connectedwebsites.table.dapps',
    defaultMessage: `!!!DApps`,
  },
  cardano: {
    id: 'connector.connectedwebsites.table.cardano',
    defaultMessage: 'Cardano, ADA'
  },
  ergo: {
    id: 'connector.connectedwebsites.table.ergo',
    defaultMessage: 'Ergo, ERG'
  }
});


@observer
export default class ConnectedWebsitesPage extends Component<Props> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  render(): Node {
    const { intl } = this.context
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
            <p>{intl.formatMessage(messages.wallets)}</p>
            <p>{intl.formatMessage(messages.dapps)}</p>
          </div>
          <div>
            {cardanoNodes.length > 0 &&
            <div className={styles.chain}>
              <h1>{intl.formatMessage(messages.cardano)}</h1>
              {cardanoNodes}
              <div className={styles.line}>
                <div />
              </div>
            </div>
            }
            {ergoNodes.length > 0 &&
            <div className={styles.chain}>
              <h1>{intl.formatMessage(messages.ergo)}</h1>
              {ergoNodes}
            </div>}
          </div>
        </div>
        <Box
          sx={{
            backgroundColor: 'var(--yoroi-palette-common-white)',
            display: 'flex',
            flexDirection: 'column',
            borderRadius: '8px',
            height: '600px',
            overflowY: 'auto',
            marginTop: '40px',
            marginLeft: '40px',
          }}
        >
          {BRANDED_DAPPS.map(dapp => <DApp key={dapp.id} dapp={dapp} />)}
        </Box>
      </div>
    )
  }
}